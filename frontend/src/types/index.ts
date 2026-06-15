export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  task_count: number;
  completed_task_count: number;
  most_recent_due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  project: number;
  project_name: string;
  assignee: string;
  priority: TaskPriority;
  due_date: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProjectSummary {
  name: string;
  total_tasks: number;
  completed_tasks: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
