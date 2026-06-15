from django.contrib import admin

from .models import Project, Task


class TaskInline(admin.TabularInline):
    model = Task
    extra = 0
    fields = ("title", "assignee", "priority", "due_date", "is_complete")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "status", "created_at", "updated_at")
    list_filter = ("status", "created_at")
    search_fields = ("name", "description")
    inlines = [TaskInline]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "assignee", "priority", "due_date", "is_complete")
    list_filter = ("priority", "is_complete", "project", "due_date")
    search_fields = ("title", "assignee", "project__name")
    autocomplete_fields = ("project",)
