from rest_framework import serializers

from .models import Project, Task


class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "project",
            "project_name",
            "assignee",
            "priority",
            "due_date",
            "is_complete",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ProjectSerializer(serializers.ModelSerializer):
    task_count = serializers.IntegerField(read_only=True, required=False)
    completed_task_count = serializers.IntegerField(read_only=True, required=False)
    most_recent_due_date = serializers.DateField(read_only=True, required=False)

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "status",
            "task_count",
            "completed_task_count",
            "most_recent_due_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ProjectSummarySerializer(serializers.Serializer):
    name = serializers.CharField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
