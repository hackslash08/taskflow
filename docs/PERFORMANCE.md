# Task 3 — Database Query & Performance Notes

## 1. Annotate Query (Single Query)

**File:** `backend/projects/queries.py`

```python
Project.objects.annotate(
    task_count=Count("tasks"),
    completed_task_count=Count("tasks", filter=Q(tasks__is_complete=True)),
    most_recent_due_date=Max("tasks__due_date"),
)
```

This retrieves all projects with aggregated task statistics in **one database round-trip** using SQL `GROUP BY` with `COUNT`, conditional `COUNT`, and `MAX`.

---

## 2. N+1 Fix: `select_related` vs `prefetch_related`

**Problem:** `TaskSerializer` exposes `project_name` via `source="project.name"`. Without optimization, listing 20 tasks triggers:
- 1 query to fetch tasks
- 20 additional queries (one per task) to fetch each related project

**Fix in** `TaskViewSet.get_queryset()`:

```python
return Task.objects.select_related("project").all()
```

### Why `select_related`?

| Method | Use Case | SQL Strategy |
|--------|----------|--------------|
| `select_related` | Forward FK, OneToOne (many-to-one) | SQL `JOIN` — fetches related object in same query |
| `prefetch_related` | Reverse FK, M2M (one-to-many, many-to-many) | Separate query + Python join in memory |

`Task.project` is a **forward ForeignKey** (many tasks → one project). A JOIN is the most efficient approach.

`prefetch_related` would be correct for `Project.tasks.all()` (reverse relation) but is unnecessary overhead for a forward FK.

---

## 3. Raw SQL Equivalent

**File:** `backend/projects/sql_reference.py`

```sql
SELECT
    p.id,
    p.name,
    COUNT(t.id) AS task_count,
    COUNT(CASE WHEN t.is_complete THEN 1 END) AS completed_task_count,
    MAX(t.due_date) AS most_recent_due_date
FROM projects_project p
LEFT JOIN projects_task t ON t.project_id = p.id
GROUP BY p.id, p.name, ...
ORDER BY p.created_at DESC;
```

### Differences from ORM

1. **Lazy evaluation** — Django queryset builds SQL only when evaluated (iteration, `list()`, serialization).
2. **Conditional aggregation** — `Count("tasks", filter=Q(...))` maps to `COUNT(CASE WHEN ... THEN 1 END)`.
3. **Portability** — ORM generates dialect-specific SQL; raw SQL is PostgreSQL-specific here.
4. **GROUP BY** — Django includes all non-aggregated selected columns in `GROUP BY` automatically.
5. **Table names** — Django uses `appname_modelname` convention (`projects_project`, `projects_task`).
