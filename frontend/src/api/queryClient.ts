import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: number) => ['projects', id] as const,
  projectSummary: (id: number) => ['projects', id, 'summary'] as const,
  tasks: (projectId?: number) => ['tasks', projectId ?? 'all'] as const,
};
