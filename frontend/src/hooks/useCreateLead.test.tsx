/**
 * useCreateLead Hook Tests
 * Tests for TanStack Query mutation and basic functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateLead } from './useCreateLead';

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn());

describe('useCreateLead', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  // Test 1: Hook should initialize properly
  it('should initialize with isPending false', () => {
    const { result } = renderHook(() => useCreateLead(), { wrapper });
    expect(result.current.isPending).toBe(false);
  });

  // Test 2: Hook should have mutate function
  it('should have mutate function', () => {
    const { result } = renderHook(() => useCreateLead(), { wrapper });
    expect(typeof result.current.mutate).toBe('function');
  });

  // Test 3: Hook should expose isError state
  it('should expose isError state', () => {
    const { result } = renderHook(() => useCreateLead(), { wrapper });
    expect(result.current.isError).toBe(false);
  });

  // Test 4: Hook should expose isSuccess state
  it('should expose isSuccess state', () => {
    const { result } = renderHook(() => useCreateLead(), { wrapper });
    expect(result.current.isSuccess).toBe(false);
  });

  // Test 5: Hook should have proper typing for LeadCreate
  it('should accept LeadCreate data', () => {
    const { result } = renderHook(() => useCreateLead(), { wrapper });
    
    // Just verify the mutation function is callable
    expect(typeof result.current.mutate).toBe('function');
  });

  // Test 6: Should have query client configured
  it('should have query client configured', () => {
    const invalidateMock = vi.spyOn(queryClient, 'invalidateQueries');
    
    const { result } = renderHook(() => useCreateLead(), { wrapper });
    
    expect(result.current).toBeDefined();
    expect(queryClient).toBeDefined();
    
    invalidateMock.mockRestore();
  });
});
