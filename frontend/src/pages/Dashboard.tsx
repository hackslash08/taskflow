import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../api/projects';
import { queryKeys } from '../api/queryClient';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectGridSkeleton } from '../components/ProjectCardSkeleton';
import type { Project } from '../types';

type StatusFilter = 'all' | 'active' | 'completed';

export function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.projects,
    queryFn: fetchProjects,
  });

  const filteredProjects = useMemo(() => {
    if (!data) return [];

    return data.filter((project: Project) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && project.status === 'active') ||
        (statusFilter === 'completed' && project.status === 'completed');

      const matchesSearch = project.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [data, searchQuery, statusFilter]);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Your projects at a glance.</p>
      </header>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as StatusFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                statusFilter === filter
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:max-w-xs"
          aria-label="Search projects by name"
        />
      </div>

      {isLoading && <ProjectGridSkeleton />}

      {isError && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
          role="alert"
        >
          <p className="font-medium text-red-800">Failed to load projects</p>
          <p className="mt-1 text-sm text-red-600">
            {(error as { message?: string })?.message ?? 'Unknown error'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && filteredProjects.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-lg font-medium text-slate-700">No projects found</p>
          <p className="mt-2 text-sm text-slate-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'No projects have been created yet.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredProjects.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
