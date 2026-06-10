/**
 * LeadCard Component - Individual Lead Card
 * Displays lead information: name, company, email
 * Shows action buttons on hover
 * Prepared for drag-and-drop in E3-S3
 */

import { useState } from 'react';
import type { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  onEdit?: (leadId: string | number) => void;
  onDelete?: (leadId: string | number) => void;
}

export default function LeadCard({ lead, onEdit, onDelete }: LeadCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={`
        p-3 rounded-lg border-2 transition-all duration-150 cursor-grab
        ${isHovering
          ? 'border-blue-500 shadow-md bg-blue-50'
          : 'border-gray-200 shadow-sm bg-white'}
      `}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="article"
      aria-label={`Lead: ${lead.name} de ${lead.company}`}
      draggable={false}
    >
      {/* Lead Name - Bold */}
      <p className="font-semibold text-gray-900 text-sm truncate" title={lead.name}>
        {lead.name}
      </p>

      {/* Company - Medium Gray */}
      <p className="text-gray-600 text-xs mt-1 truncate" title={lead.company}>
        {lead.company}
      </p>

      {/* Email - Light Gray */}
      <p className="text-gray-400 text-xs mt-0.5 truncate" title={lead.email}>
        {lead.email}
      </p>

      {/* Action Buttons - Visible on Hover */}
      {isHovering && (
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
