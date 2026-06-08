/**
 * Centralized query keys for TanStack Query
 * Prevents key duplication and typos across the application
 */

export const queryKeys = {
  all: ['leads'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: () => [...queryKeys.lists()] as const,
  searches: () => [...queryKeys.all, 'search'] as const,
  search: (query: string) => [...queryKeys.searches(), query] as const,
  timelines: () => [...queryKeys.all, 'timeline'] as const,
  timeline: (leadId: number) => [...queryKeys.timelines(), leadId] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (leadId: number) => [...queryKeys.details(), leadId] as const,
} as const;
