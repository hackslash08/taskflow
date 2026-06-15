# Prompt Engineering Artifacts

This folder contains the single prompts required by **Section A Task 4** and **Section B Task 4** of the Candidate Screening Assessment.

---

## Section A — Task 4: Database Seed Management Command

```
Create a complete Django management command for the "projects" app in a Django 5.x project called "taskflow".

Requirements:
- Command name: seed_data
- File location: projects/management/commands/seed_data.py
- Seed exactly 50 realistic software/engineering project names with varied statuses (active, on_hold, completed, archived)
- Seed exactly 200 tasks distributed randomly across those projects
- Tasks must have realistic titles, assignee names (text field), varied priorities (low, medium, high, urgent), due dates spanning 30 days in the past to 60 days in the future, and roughly 35% marked as complete
- Use bulk_create for performance
- Wrap the entire operation in a database transaction
- Add a --clear flag that deletes all existing projects and tasks before seeding
- Use the existing models: Project (name, description, status, created_at, updated_at) and Task (title, project FK, assignee, priority, due_date, is_complete)
- Output a success message with counts using self.stdout.write(self.style.SUCCESS(...))
- Do not use external libraries beyond Django stdlib (random, datetime)
```

**Implementation:** `backend/projects/management/commands/seed_data.py`

---

## Section B — Task 4: Accessible Modal Component

```
Create a fully typed, accessible, reusable Modal component in React 18 + TypeScript for a Vite project using TailwindCSS.

Requirements:
- File: src/components/Modal.tsx
- Props interface: isOpen (boolean), onClose (callback), title (string), children (ReactNode), footer (optional ReactNode slot for action buttons)
- Render nothing when isOpen is false
- Semi-transparent overlay with click-to-close
- Dialog panel with open/close visual transition (CSS transitions, no external animation library)
- Keyboard support: Escape key closes modal
- Focus trap: Tab and Shift+Tab cycle only within focusable elements inside the modal
- Restore focus to the previously focused element when modal closes
- Lock body scroll while open
- ARIA: role="dialog", aria-modal="true", aria-labelledby pointing to the title
- Close button with aria-label in the header
- TypeScript strict mode compatible, no any types
- Export both the component and ModalProps interface
```

**Implementation:** `frontend/src/components/Modal.tsx`

---

## Section B — Task 3: Reusable API Client Prompt

```
Create a reusable Axios API client module for a React 18 + TypeScript + Vite project.

File: src/api/client.ts

Requirements:
- Export a configured axios instance named apiClient
- Base URL from import.meta.env.VITE_API_BASE_URL with fallback to '/api'
- Default Content-Type: application/json
- 15 second timeout
- Request interceptor: read auth token from localStorage key 'auth_token',
  attach as Authorization: Bearer <token> if present
- Response interceptor: on error, normalize to a typed ApiError object with
  message (from response.data.detail or error.message) and status code
- TypeScript strict mode, no any types
- Export apiClient as named export
```

**Implementation:** `frontend/src/api/client.ts`

---

## State Management Choice (Section B — Task 2)

**Choice: TanStack React Query**

**Justification:**
- Project and task data are server state fetched from a REST API, not client-owned global UI state.
- React Query provides built-in caching, loading/error states, refetching, and optimistic update patterns via `useMutation` with `onMutate` rollback.
- Zustand is better for client-only state (filters, modals, theme). Dashboard filters are local `useState` since they don't need to be global.
- React Query reduces boilerplate compared to manually syncing API responses into a Zustand store.
