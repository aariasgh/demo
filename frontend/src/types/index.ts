export type LeadStatus = 'Nuevo' | 'En contacto' | 'Propuesta enviada' | 'Cerrado';
export type LeadPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';

export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  status: LeadStatus;
  priority?: LeadPriority;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadCreate {
  name: string;
  company: string;
  email: string;
  phone?: string;
  notes?: string;
}

// LeadUpdate allows partial updates to an existing lead
export type LeadUpdate = Partial<LeadCreate>;

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface AuditLogEvent {
  id: number;
  lead_id: number;
  event_type: string;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  description?: string | null;
  created_by?: User | null;
  created_at: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}
