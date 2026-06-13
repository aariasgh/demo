// frontend/src/pages/TimelineView.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import TimelineHeader from '../components/TimelineHeader';
import TimelineFilterBar from '../components/TimelineFilterBar';
import TimelineEventList from '../components/TimelineEventList';
import TimelineAddButton from '../components/TimelineAddButton';
import { apiClient } from '../services/apiClient';

export default function TimelineView() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string | null>(null);
  
  const leadIdNum = parseInt(leadId || '0', 10);
  
  // Fetch lead details
  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ['lead', leadIdNum],
    queryFn: async () => {
      const response = await apiClient.get(`/api/leads/${leadIdNum}`);
      return response.data;
    },
    enabled: leadIdNum > 0,
  });
  
  // Fetch timeline events
  const { 
    data: timelineData, 
    isLoading, 
    error, 
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['timeline', leadIdNum, filterType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterType) params.append('event_type', filterType);
      const response = await apiClient.get(`/api/leads/${leadIdNum}/timeline?${params}`);
      return response.data;
    },
    enabled: leadIdNum > 0,
  });
  
  const events = timelineData?.data || [];
  
  if (leadLoading || isLoading) return <div data-testid="timeline-loading">Cargando...</div>;
  if (error) return <div data-testid="timeline-error">Error al cargar timeline</div>;
  
  return (
    <div data-testid="timeline-container" className="min-h-screen bg-gray-50 p-6">
      <TimelineHeader 
        leadName={lead?.name} 
        onBack={() => navigate('/leads')}
      />
      
      <TimelineFilterBar 
        selectedType={filterType}
        onFilterChange={setFilterType}
      />
      
      <TimelineEventList 
        events={events}
        onEventDeleted={() => refetch()}
        isEmpty={events.length === 0}
        isLoading={isRefetching}
      />
      
      <TimelineAddButton 
        leadId={leadIdNum}
        onEventAdded={() => refetch()}
      />
    </div>
  );
}
