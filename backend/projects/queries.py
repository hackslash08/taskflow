from django.db.models import Count, Max, Q

from .models import Project


def get_projects_with_task_stats():
    return Project.objects.annotate(
        task_count=Count("tasks"),
        completed_task_count=Count("tasks", filter=Q(tasks__is_complete=True)),
        most_recent_due_date=Max("tasks__due_date"),
    )
