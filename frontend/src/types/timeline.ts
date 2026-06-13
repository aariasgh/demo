// frontend/src/types/timeline.ts

export interface TimelineEvent {
  id: number;
  lead_id: number;
  event_type: 'LEAD_CREATED' | 'STATUS_CHANGED' | 'NOTE_ADDED' | 'CALL_MADE' | 'EMAIL_SENT';
  description: string;
  timestamp: string;
  event_metadata?: Record<string, any>;
  created_by: string;
}

export interface TimelineListResponse {
  data: TimelineEvent[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface TimelineEventCreate {
  event_type: string;
  description: string;
  metadata?: Record<string, any>;
}
