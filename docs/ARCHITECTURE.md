# Architecture Documentation

## Overview

TaskFlow is a monorepo containing a Django REST API backend and a React SPA frontend. The two services communicate over HTTP JSON and are developed independently but deployed together.

## Backend Architecture

### Layered Design

```
HTTP Request
    │
    ▼
URL Router (taskflow/urls.py → projects/urls.py)
    │
    ▼
ViewSet (projects/views.py)
    │
    ├── Serializer (validation + JSON)
    ├── FilterSet (query params)
    └── Queryset (ORM + annotations)
    │
    ▼
Model Layer (projects/models.py)
    │
    ▼
PostgreSQL
```

### Data Model

```
Project                          Task
┌─────────────────────┐          ┌─────────────────────┐
│ id (PK)             │◄─────────│ project_id (FK)     │
│ name                │  1    *  │ title               │
│ description         │          │ assignee            │
│ status (choices)    │          │ priority (choices)  │
│ created_at          │          │ due_date            │
│ updated_at          │          │ is_complete         │
└─────────────────────┘          │ created_at          │
                                 │ updated_at          │
                                 └─────────────────────┘
```

**Status choices:** `active`, `on_hold`, `completed`, `archived`  
**Priority choices:** `low`, `medium`, `high`, `urgent`

### API Design

- **ViewSets** provide standard CRUD for `/api/projects/` and `/api/tasks/`
- **Custom action** `@action(detail=True)` exposes `GET /api/projects/{id}/summary/`
- **Filtering** via `django-filter` FilterSet on TaskViewSet
- **Pagination** via custom `StandardResultsSetPagination` (default 20, max 100)
- **Ordering** via DRF `OrderingFilter`

### Query Optimization

| Endpoint | Optimization | Reason |
|----------|-------------|--------|
| `GET /api/projects/` | `annotate(Count, Max)` | Single query for stats |
| `GET /api/tasks/` | `select_related("project")` | Avoid N+1 on `project.name` |
| `GET /api/projects/{id}/summary/` | Detail view (2 count queries acceptable) | Single project scope |

## Frontend Architecture

### Folder Structure

```
src/
├── api/
│   ├── client.ts        # Axios instance + interceptors
│   ├── projects.ts      # API functions
│   └── queryClient.ts   # React Query config + keys
├── components/
│   ├── Layout.tsx       # Sidebar shell
│   ├── ProjectCard.tsx  # Typed presentational component
│   ├── ProjectCardSkeleton.tsx
│   └── Modal.tsx        # Accessible reusable modal
├── pages/
│   ├── Dashboard.tsx    # Project grid + filters
│   ├── ProjectDetail.tsx# Tasks + optimistic toggle
│   └── NotFound.tsx
├── types/
│   └── index.ts         # Shared TypeScript interfaces
├── App.tsx              # Route definitions
└── main.tsx             # Entry + QueryClientProvider
```

### State Management Strategy

| State Type | Solution | Examples |
|------------|----------|----------|
| Server state | TanStack React Query | Projects list, tasks, summaries |
| UI state (local) | `useState` | Search query, status filter |
| Optimistic updates | `useMutation` + `onMutate` | Task completion toggle |

### Data Flow

```
Dashboard Page
    │
    ├── useQuery(['projects']) ──► fetchProjects() ──► GET /api/projects/
    │
    └── ProjectCard (props) ──► Link to /projects/:id

ProjectDetail Page
    │
    ├── useQuery(['projects', id]) ──► GET /api/projects/:id/
    ├── useQuery(['projects', id, 'summary']) ──► GET /api/projects/:id/summary/
    ├── useQuery(['tasks', id]) ──► GET /api/tasks/?project=id
    │
    └── useMutation(toggleTaskComplete)
            ├── onMutate: optimistic cache update
            ├── onError: rollback
            └── onSettled: invalidate queries
```

### Error Handling

- **Axios interceptor** normalizes errors to `{ message, status }`
- **React Query** surfaces `isLoading`, `isError`, `error` per query
- **UI states:** skeleton loaders, error alerts with retry, empty state messages

## Security Considerations (Dev)

- CORS restricted to `localhost:5173`
- `AllowAny` permissions for assessment simplicity
- Auth token interceptor ready in Axios client (Bearer from localStorage)
- Production would require: authentication, HTTPS, secret management, rate limiting

