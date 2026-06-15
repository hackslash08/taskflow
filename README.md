# TaskFlow 

Full-stack project management application built for the **Uplers AI-Assisted Development** coding assessment. Implements **Section A (Django/Python)** and **Section B (React/Vite)** requirements.

## Architecture

```
uplers-test/
├── backend/                 # Django 5.x + DRF API
│   ├── taskflow/            # Project settings & URLs
│   └── projects/            # Models, admin, API, queries, seed command
├── frontend/                # React 18 + Vite + TypeScript + TailwindCSS
│   └── src/
│       ├── api/             # Axios client + React Query keys
│       ├── components/      # Layout, ProjectCard, Modal, Skeletons
│       └── pages/           # Dashboard, ProjectDetail, NotFound
├── docker-compose.yml       # PostgreSQL 16
├── docs/
│   ├── ARCHITECTURE.md      # Detailed system design
│   ├── ASSESSMENT_REVIEW.md # Task audit, tradeoffs, prompts, reviewer Q&A
│   ├── VIDEO_WALKTHROUGH.md # Script for recording project walkthrough video
│   └── prompts/             # Prompt engineering artifacts (Task 4)
└── README.md
```

### System Diagram

```
┌─────────────────┐     HTTP/JSON      ┌──────────────────────┐
│  React Frontend │ ◄────────────────► │  Django REST API     │
│  (Vite :5173)   │   /api/projects    │  (Django :8000)      │
│  React Query    │   /api/tasks       │  DRF ViewSets        │
└─────────────────┘                    └──────────┬───────────┘
                                                  │
                                                  ▼
                                       ┌──────────────────────┐
                                       │  PostgreSQL 16       │
                                       │  (Docker :5432)      │
                                       └──────────────────────┘
```

## Tech Stack

| Layer    | Technologies |
|----------|-------------|
| Backend  | Python 3.12+, Django 5.x, Django REST Framework, django-filter, PostgreSQL |
| Frontend | React 18, Vite, TypeScript, TailwindCSS, React Router, TanStack React Query, Axios |
| DevOps   | Docker Compose (PostgreSQL) |

## Prerequisites

- **Python 3.12+**
- **Node.js 18+** and npm
- **Docker Desktop** (for PostgreSQL)

## Quick Start

### 1. Start PostgreSQL

```powershell
cd c:\codebases\uplers-test
docker compose up -d
```

Wait until the database is healthy:

```powershell
docker compose ps
```

### 2. Backend Setup

```powershell
cd c:\codebases\uplers-test

# Create and activate virtual environment (first time only)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies (first time only)
pip install -r backend\requirements.txt

# Copy env file (first time only — already provided)
copy backend\.env.example backend\.env

# Run migrations
cd backend
python manage.py migrate

# Seed sample data (50 projects, 200 tasks)
python manage.py seed_data --clear

# Create admin superuser (optional)
python manage.py createsuperuser

# Start API server
python manage.py runserver
```

API available at: **http://localhost:8000/api/**  
Admin panel: **http://localhost:8000/admin/**

### 3. Frontend Setup

Open a **new terminal**:

```powershell
cd c:\codebases\uplers-test\frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Frontend available at: **http://localhost:5173**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/projects/` | List/create projects (paginated, orderable) |
| GET/PUT/PATCH/DELETE | `/api/projects/{id}/` | Project CRUD |
| GET | `/api/projects/{id}/summary/` | Project name, total tasks, completed tasks |
| GET/POST | `/api/tasks/` | List/create tasks (filterable) |
| GET/PUT/PATCH/DELETE | `/api/tasks/{id}/` | Task CRUD |

### Query Parameters

**Tasks filtering:**
- `?project=1` — filter by project ID
- `?priority=high` — filter by priority
- `?is_complete=true` — filter by completion status

**Pagination & ordering:**
- `?page=2` — page number (20 items per page)
- `?page_size=50` — override page size (max 100)
- `?ordering=-created_at` — sort results

## Assessment Coverage

### Section A — Python/Django ✅

| Task | Status | Location |
|------|--------|----------|
| Project scaffolding (taskflow + projects app) | ✅ | `backend/` |
| Models: Project, Task | ✅ | `projects/models.py` |
| PostgreSQL migrations | ✅ | `projects/migrations/` |
| Django Admin with list_display & filters | ✅ | `projects/admin.py` |
| DRF CRUD ViewSets + Routers | ✅ | `projects/views.py`, `urls.py` |
| Task filtering (project, priority, is_complete) | ✅ | `projects/views.py` |
| Custom `/summary/` action | ✅ | `ProjectViewSet.summary` |
| Pagination (20) + ordering | ✅ | `pagination.py`, settings |
| Annotate query (task count + recent due date) | ✅ | `projects/queries.py` |
| N+1 fix with `select_related` | ✅ | `TaskViewSet.get_queryset` |
| Raw SQL reference + explanation | ✅ | `projects/sql_reference.py` |
| Seed management command | ✅ | `management/commands/seed_data.py` |
| Prompt engineering (seed command) | ✅ | `docs/prompts/PROMPTS.md` |

### Section B — React/Vite ✅

| Task | Status | Location |
|------|--------|----------|
| Vite + React + TypeScript + TailwindCSS | ✅ | `frontend/` |
| React Router with Layout sidebar | ✅ | `components/Layout.tsx` |
| Pages: Dashboard, ProjectDetail, NotFound | ✅ | `pages/` |
| Catch-all 404 route | ✅ | `App.tsx` |
| ProjectCard with typed props | ✅ | `components/ProjectCard.tsx` |
| Dashboard with status filter + search | ✅ | `pages/Dashboard.tsx` |
| React Query for server state | ✅ | `api/queryClient.ts` |
| Loading skeletons, error & empty states | ✅ | `Dashboard.tsx`, skeletons |
| Optimistic task toggle | ✅ | `ProjectDetail.tsx` |
| Reusable Axios API client | ✅ | `api/client.ts` |
| Accessible Modal component | ✅ | `components/Modal.tsx` |
| Prompt engineering (Modal) | ✅ | `docs/prompts/PROMPTS.md` |

## Performance Notes

### Annotate Query (single DB query)

```python
Project.objects.annotate(
    task_count=Count("tasks"),
    completed_task_count=Count("tasks", filter=Q(tasks__is_complete=True)),
    most_recent_due_date=Max("tasks__due_date"),
)
```

### N+1 Fix: `select_related` vs `prefetch_related`

- **Problem:** `TaskSerializer` reads `project.name` for each task → without optimization, Django runs 1 query for tasks + N queries for each project.
- **Fix:** `Task.objects.select_related("project")` — uses SQL JOIN to fetch the related `Project` in the same query.
- **Why not `prefetch_related`?** That is for reverse FK or M2M (one-to-many / many-to-many). `Task → Project` is a forward ForeignKey (many-to-one), so `select_related` is the correct, more efficient choice.

## Development Commands

```powershell
# Backend tests / lint
cd backend
python manage.py check

# Frontend type check & build
cd frontend
npm run lint
npm run build

# Stop database
docker compose down

# Reset database (destructive)
docker compose down -v
docker compose up -d
cd backend
python manage.py migrate
python manage.py seed_data --clear
```

## Environment Variables

**Backend** (`backend/.env`):

| Variable | Default |
|----------|---------|
| DEBUG | True |
| SECRET_KEY | (dev key) |
| DB_NAME | taskflow |
| DB_USER | taskflow |
| DB_PASSWORD | taskflow |
| DB_HOST | localhost |
| DB_PORT | 5433 |

**Frontend** (`frontend/.env`):

| Variable | Default |
|----------|---------|
| VITE_API_BASE_URL | http://localhost:8000/api |

## License

Built for assessment purposes.
