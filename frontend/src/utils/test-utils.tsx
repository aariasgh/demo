/**
 * Test Utilities - Redux Provider Wrapper + DragDropContext
 * Provides Redux store, React Query context, and Drag-Drop context for component tests
 * Fixes: react-beautiful-dnd requiring both Redux store AND DragDropContext
 * 
 * Uses react-redux v7 for compatibility with react-beautiful-dnd v13
 */

import React, { type ReactElement } from 'react';
import { render, type RenderOptions, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { DragDropContext } from 'react-beautiful-dnd';

// Create a minimal Redux store compatible with react-beautiful-dnd
export function createTestStore() {
  const initialState = {};
  
  const reducer = (state = initialState) => state;
  
  return createStore(reducer);
}

// Test wrapper component that provides Redux, React Query, and DragDropContext
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  store?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    store = createTestStore(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <DragDropContext onDragEnd={() => {}}>
            {children}
          </DragDropContext>
        </QueryClientProvider>
      </Provider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), store };
}

// Re-export testing utilities
export { screen, fireEvent };
