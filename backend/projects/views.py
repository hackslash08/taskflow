from django_filters import rest_framework as filters
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Project, Task
from .queries import get_projects_with_task_stats
from .serializers import ProjectSerializer, ProjectSummarySerializer, TaskSerializer


class TaskFilter(filters.FilterSet):
    project = filters.NumberFilter(field_name="project_id")
    priority = filters.ChoiceFilter(choices=Task._meta.get_field("priority").choices)
    is_complete = filters.BooleanFilter()

    class Meta:
        model = Task
        fields = ["project", "priority", "is_complete"]


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    ordering_fields = ["name", "status", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return get_projects_with_task_stats()

    @action(detail=True, methods=["get"])
    def summary(self, request, pk=None):
        project = get_projects_with_task_stats().get(pk=pk)
        serializer = ProjectSummarySerializer(
            {
                "name": project.name,
                "total_tasks": project.task_count,
                "completed_tasks": project.completed_task_count,
            }
        )
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    filterset_class = TaskFilter
    ordering_fields = ["title", "priority", "due_date", "is_complete", "created_at"]
    ordering = ["due_date"]

    def get_queryset(self):
        return Task.objects.select_related("project").all()
