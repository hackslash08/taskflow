import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  fetchProject,
  fetchProjectSummary,
  fetchTasks,
  toggleTaskComplete,
} from '../api/projects';
import { queryKeys } from '../api/queryClient';
import type { Task } from '../types';

const priorityColors: Record<Task['priority'], string> = {
  low: 'text-slate-600',
  medium: 'text-blue-600',
  high: 'text-amber-600',
  urgent: 'text-red-600',
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => fetchProject(projectId),
    enabled: !Number.isNaN(projectId),
  });

  const summaryQuery = useQuery({
    queryKey: queryKeys.projectSummary(projectId),
    queryFn: () => fetchProjectSummary(projectId),
    enabled: !Number.isNaN(projectId),
  });

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks(projectId),
    queryFn: () => fetchTasks(projectId),
    enabled: !Number.isNaN(projectId),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTaskComplete,
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks(projectId) });
      const previousTasks = queryClient.getQueryData<Task[]>(
        queryKeys.tasks(projectId),
      );

      queryClient.setQueryData<Task[]>(queryKeys.tasks(projectId), (old) =>
        old?.map((item) =>
          item.id === task.id ? { ...item, is_complete: !item.is_complete } : item,
        ),
      );

      return { previousTasks };
    },
    onError: (_error, _task, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks(projectId), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectSummary(projectId) });
    },
  });

  if (projectQuery.isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="h-64 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6" role="alert">
          <p className="font-medium text-red-800">Project not found</p>
          <Link to="/" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const project = projectQuery.data;
  const summary = summaryQuery.data;
  const tasks = tasksQuery.data ?? [];

  return (
    <div className="p-8">
      <Link to="/" className="text-sm text-brand-600 hover:underline">
        &larr; Back to Dashboard
      </Link>

      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
        <p className="mt-2 max-w-3xl text-slate-600">{project.description}</p>
        {summary && (
          <p className="mt-3 text-sm text-slate-500">
            {summary.completed_tasks} of {summary.total_tasks} tasks completed
          </p>
        )}
      </header>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Tasks</h2>

        {tasksQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-lg bg-slate-200" />
            ))}
          </div>
        )}

        {tasksQuery.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700" role="alert">
            Failed to load tasks.
          </div>
        )}

        {!tasksQuery.isLoading && tasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No tasks assigned to this project yet.
          </div>
        )}

        {tasks.length > 0 && (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-4 px-4 py-3 transition hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={task.is_complete}
                  onChange={() => toggleMutation.mutate(task)}
                  disabled={toggleMutation.isPending}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  aria-label={`Mark "${task.title}" as ${task.is_complete ? 'incomplete' : 'complete'}`}
                />
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      task.is_complete ? 'text-slate-400 line-through' : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-sm text-slate-500">
                    {task.assignee || 'Unassigned'}
                    {task.due_date && ` · Due ${new Date(task.due_date).toLocaleDateString()}`}
                  </p>
                </div>
                <span className={`text-xs font-semibold uppercase ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
