PROJECTS_WITH_TASK_STATS_SQL = """
SELECT
    p.id,
    p.name,
    p.description,
    p.status,
    p.created_at,
    p.updated_at,
    COUNT(t.id) AS task_count,
    COUNT(CASE WHEN t.is_complete THEN 1 END) AS completed_task_count,
    MAX(t.due_date) AS most_recent_due_date
FROM projects_project p
LEFT JOIN projects_task t ON t.project_id = p.id
GROUP BY p.id, p.name, p.description, p.status, p.created_at, p.updated_at
ORDER BY p.created_at DESC;
"""
