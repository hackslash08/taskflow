import type { PaginatedResponse } from '../types';
import { apiClient } from './client';

export async function fetchAllPages<T>(
  url: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;

  while (true) {
    const { data } = await apiClient.get<PaginatedResponse<T>>(url, {
      params: { ...params, page },
    });
    items.push(...data.results);
    if (!data.next) {
      break;
    }
    page += 1;
  }

  return items;
}
