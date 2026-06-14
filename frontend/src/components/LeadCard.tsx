/**
 * LeadCard Component - Individual Lead Card
 * Displays lead information: name, company, email
 * Shows action buttons on hover
 * Prepared for drag-and-drop in E3-S3
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

  return (
    <div
      className={`
        p-3 md:p-4 rounded-lg border-2 transition-all duration-150 cursor-grab hover:cursor-grabbing active:cursor-grabbing min-h-[120px]
        ${(isHovering || isTouchActive)
          ? 'border-blue-500 shadow-md bg-blue-50'
          : 'border-gray-200 shadow-sm bg-white'}
      `}
      data-testid="lead-card"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="article"
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

      {/* Action Buttons - Visible on Hover or Touch Long-Press */}
      {(isHovering || isTouchActive) && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
          {onEdit && (
            <button
              onClick={() => onEdit(lead.id)}
              className="flex-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors duration-150"
              aria-label={`Editar lead ${lead.name}`}
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(lead.id)}
              className="flex-1 px-2 py-1 text-xs font-medium bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors duration-150"
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
    </div>
  );
}
