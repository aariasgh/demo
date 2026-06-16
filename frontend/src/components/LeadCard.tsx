/**
 * LeadCard Component - Individual Lead Card
 * Displays lead information: name, company, email
 * Shows action buttons on hover
 * Prepared for drag-and-drop in E3-S3
 * AC-2.1: Keyboard alternative to drag-drop via Status dropdown
 */

import { useState, useEffect, useRef } from 'react';
import type { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  onEdit?: (leadId: string | number) => void;
  onDelete?: (leadId: string | number) => void;
}

export default function LeadCard({ lead, onEdit, onDelete }: LeadCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      setIsHovering(false);
      setIsTouchActive(false);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  const handleTouchStart = () => {
    touchTimerRef.current = setTimeout(() => {
      setIsTouchActive(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    setIsTouchActive(false);
  };

  /**
   * E6-S4 AC-3: Enter/Space to Open Lead Details Modal
   * Keyboard handler for accessible interaction
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    // Enter or Space should open the lead details
    if ((event.key === 'Enter' || event.key === ' ') && onEdit) {
      event.preventDefault();
      onEdit(lead.id);
    }
  };

  return (
    <article
      className={`
        p-3 md:p-4 rounded-lg border-2 transition-all duration-200 cursor-grab hover:cursor-grabbing active:cursor-grabbing min-h-[120px]
        focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2
        ${(isHovering || isTouchActive)
          ? 'border-blue-500 shadow-md bg-blue-50'
          : 'border-gray-200 shadow-sm bg-white'}
      `}
      data-testid="lead-card"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      role="article"
      tabIndex={0}
      aria-label={`Lead: ${lead.name} de ${lead.company}. Estado: ${lead.status}. Arrastra para cambiar estado.`}
      draggable={false}
    >
      {/* Lead Name - Bold, Responsive Font */}
      <p className="font-semibold text-gray-900 text-sm md:text-base truncate" title={lead.name}>
        {lead.name || 'Sin nombre'}
      </p>

      {/* Company - Medium Gray, Responsive */}
      <p className="text-gray-600 text-xs md:text-sm mt-1 md:mt-2 truncate" title={lead.company}>
        {lead.company || 'Sin empresa'}
      </p>

      {/* Email - Light Gray, Responsive */}
      <p className="text-gray-400 text-xs mt-0.5 md:mt-1 truncate" title={lead.email}>
        {lead.email || 'Sin email'}
      </p>

      {/* Phone - If available */}
      {lead.phone && (
        <p className="text-gray-400 text-xs mt-0.5 md:mt-1 truncate" title={lead.phone}>
          {lead.phone}
        </p>
      )}

      {/* Priority Badge */}
      {lead.priority && (
        <div className="mt-2 flex items-center gap-1">
          <span 
            className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            aria-label={`Prioridad: ${lead.priority}`}
          >
            {lead.priority}
          </span>
        </div>
      )}

      {/* Action Buttons - Visible on Hover or Touch Long-Press */}
      {(isHovering || isTouchActive) && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 animate-in fade-in duration-200">
          {onEdit && (
            <button
              onClick={() => onEdit(lead.id)}
              className="flex-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-all duration-200"
              aria-label={`Editar lead ${lead.name}`}
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(lead.id)}
              className="flex-1 px-2 py-1 text-xs font-medium bg-red-50 text-red-600 rounded hover:bg-red-100 transition-all duration-200"
              aria-label={`Eliminar lead ${lead.name}`}
            >
              Opciones
            </button>
          )}
        </div>
      )}

      {/* Metadata for Debugging */}
      <div className="text-xs text-gray-300 mt-1 hidden">
        ID: {lead.id} | Status: {lead.status}
      </div>
    </article>
  );
}
