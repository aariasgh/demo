import { test as base } from '@playwright/test';

/**
 * Fixtures for E2E Tests
 * Provides pre-configured test data and utilities
 */

export interface LeadFixture {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'Nuevo' | 'En contacto' | 'Propuesta enviada' | 'Cerrado';
  notes: string;
}

export interface TimelineEventFixture {
  id: string;
  leadId: number;
  eventType: 'LEAD_CREATED' | 'STATUS_CHANGED' | 'NOTE_ADDED' | 'CALL_MADE';
  description: string;
  timestamp: string;
}

// Test Data Fixtures
export const mockLeads: LeadFixture[] = [
  {
    id: 1,
    name: 'Carlos Ruiz',
    email: 'carlos@acme.com',
    company: 'Acme Corp',
    phone: '+1-555-0100',
    priority: 'HIGH',
    status: 'Nuevo',
    notes: 'Hot prospect from trade show',
  },
  {
    id: 2,
    name: 'María López',
    email: 'maria@techstart.io',
    company: 'TechStart Inc',
    phone: '+1-555-0101',
    priority: 'MEDIUM',
    status: 'En contacto',
    notes: 'Follow up next week',
  },
  {
    id: 3,
    name: 'Juan García',
    email: 'juan@enterprise.co',
    company: 'Enterprise Solutions',
    phone: '+1-555-0102',
    priority: 'LOW',
    status: 'Propuesta enviada',
    notes: 'Waiting for proposal review',
  },
  {
    id: 4,
    name: 'Sofia Chen',
    email: 'sofia@startup.co',
    company: 'StartUp Labs',
    phone: '+1-555-0103',
    priority: 'HIGH',
    status: 'Cerrado',
    notes: 'Deal closed - contract signed',
  },
];

export const mockTimelineEvents: TimelineEventFixture[] = [
  {
    id: 'evt-1',
    leadId: 1,
    eventType: 'LEAD_CREATED',
    description: 'Lead created from web form',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-2',
    leadId: 1,
    eventType: 'STATUS_CHANGED',
    description: 'Status changed: Nuevo → En contacto',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-3',
    leadId: 1,
    eventType: 'CALL_MADE',
    description: 'Initial discovery call - very interested',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-4',
    leadId: 1,
    eventType: 'NOTE_ADDED',
    description: 'Sent proposal documentation',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Base fixture extension
type TestFixtures = {
  mockLeads: LeadFixture[];
  mockTimelineEvents: TimelineEventFixture[];
};

export const test = base.extend<TestFixtures>({
  mockLeads: async ({}, use) => {
    await use(mockLeads);
  },
  mockTimelineEvents: async ({}, use) => {
    await use(mockTimelineEvents);
  },
});

export { expect } from '@playwright/test';
