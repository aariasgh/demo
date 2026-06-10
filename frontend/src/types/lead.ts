/**
 * Lead Domain Types
 * Data Transfer Object (DTO) that mirrors backend Lead model
 */

export interface Lead {
  id: string | number;
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: "Nuevo" | "En contacto" | "Propuesta enviada" | "Cerrado";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadListResponse {
  data: Lead[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface LeadsByStatus {
  "Nuevo": Lead[];
  "En contacto": Lead[];
  "Propuesta enviada": Lead[];
  "Cerrado": Lead[];
}
