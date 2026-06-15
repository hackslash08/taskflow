import { Link } from 'react-router-dom';
import type { Project } from '../types';

export interface ProjectCardProps {
  project: Project;
}

const statusStyles: Record<Project['status'], string> = {
  active: 'bg-emerald-100 text-emerald-800',
  on_hold: 'bg-amber-100 text-amber-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-slate-200 text-slate-700',
};

const statusLabels: Record<Project['status'], string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  archived: 'Archived',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const totalTasks = project.task_count ?? 0;
  const completedTasks = project.completed_task_count ?? 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-600">
          {project.name}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
        >
          {statusLabels[project.status]}
        </span>
      </div>

      <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-500">
        {project.description || 'No description provided.'}
      </p>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>{totalTasks} tasks</span>
          <span>{progress}% complete</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${project.name} completion progress`}
        >
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
