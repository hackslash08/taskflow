import type { Project, ProjectSummary, Task } from '../types';
import { apiClient } from './client';
import { fetchAllPages } from './pagination';

export function fetchProjects(): Promise<Project[]> {
  return fetchAllPages<Project>('/projects/');
}

export async function fetchProject(id: number): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/projects/${id}/`);
  return data;
}

export async function fetchProjectSummary(id: number): Promise<ProjectSummary> {
  const { data } = await apiClient.get<ProjectSummary>(`/projects/${id}/summary/`);
  return data;
}

export function fetchTasks(projectId?: number): Promise<Task[]> {
  return fetchAllPages<Task>('/tasks/', projectId ? { project: projectId } : {});
}

export async function toggleTaskComplete(task: Task): Promise<Task> {
  const { data } = await apiClient.patch<Task>(`/tasks/${task.id}/`, {
    is_complete: !task.is_complete,
  });
  return data;
}
