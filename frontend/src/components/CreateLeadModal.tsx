import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LeadCreateSchema, getCharacterCount, exceedsCharLimit } from '../utils/validations';
import { useCreateLead } from '../hooks/useCreateLead';
import { useUIStore } from '../store/uiStore';
import type { LeadCreateFormData } from '../utils/validations';

/**
 * CreateLeadModal Component
 * Modal form for creating new leads with validation
 *
 * Features:
 * - Real-time field validation (onBlur mode)
 * - Async email server validation (checks for duplicates)
 * - Character counter for notes field (1000 char limit)
 * - Optimistic form state (form disabled during submission)
 * - Keyboard navigation (ESC to close)
 * - Accessibility: ARIA labels, screen reader support
 */
export default function CreateLeadModal() {
  const { isCreateModalOpen, closeCreateModal } = useUIStore();
  const { mutate: createLead, isPending } = useCreateLead();
  const [notesCharCount, setNotesCharCount] = useState(0);
  const [emailValidationError, setEmailValidationError] = useState<string | null>(null);
  const [emailValidating, setEmailValidating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<LeadCreateFormData>({
    resolver: zodResolver(LeadCreateSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      notes: '',
    },
  });

  const notesValue = watch('notes');

  // Async email server validation on blur
  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value.trim();
    setEmailValidationError(null);
    
    if (!email) return; // Skip validation if empty
    
    // Only validate if email passes format check first
    try {
      setEmailValidating(true);
      const response = await fetch(`/api/leads/validate-email?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        // 409 = duplicate, 400 = invalid format, etc.
        setEmailValidationError('Email ya existe en el sistema');
      }
    } catch (error) {
      console.error('Email validation check failed:', error);
      // Don't show error on network failure; let server-side validation catch it
    } finally {
      setEmailValidating(false);
    }
  };
  useEffect(() => {
    setNotesCharCount(getCharacterCount(notesValue));
  }, [notesValue]);

  // Handle form submission
  const onSubmit = (data: LeadCreateFormData) => {
    // Skip submission if email validation error exists
    if (emailValidationError) {
      return;
    }
    
    // Convert null values to undefined for API compatibility
    const cleanedData = {
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone || undefined,
      notes: data.notes || undefined,
    };
    createLead(cleanedData, {
      onSuccess: () => {
        reset();
        closeCreateModal();
      },
    });
  };

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isCreateModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeCreateModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCreateModalOpen, closeCreateModal]);

  // Focus trap: Keep focus inside modal when open
  useEffect(() => {
    if (!isCreateModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableArray = Array.from(focusableElements);
        const focusedIndex = focusableArray.indexOf(document.activeElement as Element);

        if (event.shiftKey && focusedIndex === 0) {
          event.preventDefault();
          (focusableArray[focusableArray.length - 1] as HTMLElement).focus();
        } else if (!event.shiftKey && focusedIndex === focusableArray.length - 1) {
          event.preventDefault();
          (focusableArray[0] as HTMLElement).focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCreateModalOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeCreateModal();
    }
  };

  if (!isCreateModalOpen) return null;

  const notesExceedsLimit = exceedsCharLimit(notesValue, 1000);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      data-testid="create-lead-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Modal Container: flex layout with sticky footer to prevent button scroll-out */}
      <div className="bg-white rounded-lg shadow-lg xs:max-w-[90vw] sm:max-w-md max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 id="modal-title" className="text-lg md:text-xl font-semibold text-gray-900">
            Crear Lead
          </h2>
          <button
            onClick={closeCreateModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar modal"
            type="button"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Form: scrollable content area */}
        <form onSubmit={handleSubmit(onSubmit)} id="create-lead-form" className="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto flex-1" data-testid="create-lead-form">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ej: Juan García"
              {...register('name')}
              data-testid="lead-name-input"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base min-h-[44px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isPending}
            />
            {errors.name && (
              <p id="name-error" className="text-red-600 text-xs md:text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Company Field */}
          <div>
            <label htmlFor="company" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Empresa <span className="text-red-500">*</span>
            </label>
            <input
              id="company"
              type="text"
              placeholder="Ej: TechCorp"
              {...register('company')}
              aria-invalid={!!errors.company}
              aria-describedby={errors.company ? 'company-error' : undefined}
              className={`w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base min-h-[44px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.company ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isPending}
            />
            {errors.company && (
              <p id="company-error" className="text-red-600 text-xs md:text-sm mt-1">
                {errors.company.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="Ej: juan@techcorp.com"
              {...register('email')}
              onBlur={handleEmailBlur}
              aria-invalid={!!(errors.email || emailValidationError)}
              aria-describedby={errors.email || emailValidationError ? 'email-error' : undefined}
              disabled={isPending}
              className={`w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base min-h-[44px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.email || emailValidationError ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {emailValidating && (
              <p className="text-blue-600 text-xs md:text-sm mt-1">Verificando email...</p>
            )}
            {(errors.email || emailValidationError) && (
              <p id="email-error" className="text-red-600 text-xs md:text-sm mt-1">
                {emailValidationError || errors.email?.message}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Ej: +34917777777"
              {...register('phone')}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={`w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base min-h-[44px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isPending}
            />
            {errors.phone && (
              <p id="phone-error" className="text-red-600 text-xs md:text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Notes Field */}
          <div>
            <label htmlFor="notes" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              id="notes"
              placeholder="Notas adicionales..."
              maxLength={1000}
              {...register('notes')}
              aria-invalid={notesExceedsLimit}
              aria-describedby={notesExceedsLimit ? 'notes-error' : 'notes-count'}
              className={`w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none h-24 min-h-[120px] ${
                notesExceedsLimit ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isPending}
            />
            {notesExceedsLimit && (
              <p id="notes-error" className="text-red-600 font-semibold text-xs md:text-sm mt-1">
                Límite de caracteres excedido
              </p>
            )}
            <p
              id="notes-count"
              className={`text-xs md:text-sm ${
                notesExceedsLimit ? 'text-red-600 font-semibold' : 'text-gray-500'
              }`}
            >
              {notesCharCount} / 1000
            </p>
          </div>
        </form>

        {/* Sticky Footer: Submit Buttons (outside scrollable form to prevent scroll-out) */}
        <div className="flex gap-3 md:gap-4 p-4 md:p-6 border-t border-gray-200 bg-white flex-shrink-0 sticky bottom-0">
          <button
            type="button"
            onClick={closeCreateModal}
            disabled={isPending}
            className="flex-1 px-4 md:px-6 py-2 md:py-3 text-sm md:text-base min-h-[48px] border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            tabIndex={0}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-lead-form"
            disabled={!isValid || isPending || notesExceedsLimit || !!emailValidationError || emailValidating}
            className="flex-1 px-4 md:px-6 py-2 md:py-3 text-sm md:text-base min-h-[48px] bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            tabIndex={0}
          >
            {isPending && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isPending ? 'Creando...' : 'Crear Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
