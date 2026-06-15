import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction

from projects.models import Project, ProjectStatus, Task, TaskPriority


PROJECT_NAMES = [
    "Customer Portal Redesign",
    "Mobile App v2",
    "API Gateway Migration",
    "Data Warehouse Pipeline",
    "Security Audit Remediation",
    "Onboarding Flow Optimization",
    "Billing System Upgrade",
    "Internal Admin Dashboard",
    "Marketing Site Refresh",
    "Inventory Sync Service",
    "Support Ticket Automation",
    "Analytics Platform",
    "CI/CD Pipeline Hardening",
    "Search Index Rebuild",
    "Partner Integration Hub",
    "Compliance Documentation",
    "Performance Benchmarking",
    "Notification Service",
    "Feature Flag Platform",
    "Legacy System Decommission",
]

TASK_TITLES = [
    "Define requirements",
    "Create wireframes",
    "Set up repository",
    "Write unit tests",
    "Implement API endpoint",
    "Review pull request",
    "Update documentation",
    "Fix regression bug",
    "Deploy to staging",
    "Conduct user testing",
    "Optimize database queries",
    "Configure monitoring",
    "Refactor legacy module",
    "Add error handling",
    "Validate accessibility",
    "Sync with design team",
    "Prepare release notes",
    "Run security scan",
    "Migrate configuration",
    "Close out sprint tasks",
]

ASSIGNEES = [
    "Alex Chen",
    "Jordan Lee",
    "Sam Patel",
    "Taylor Brooks",
    "Morgan Davis",
    "Casey Nguyen",
    "Riley Johnson",
    "Quinn Martinez",
    "Avery Wilson",
    "Drew Anderson",
]


class Command(BaseCommand):
    help = "Seed the database with 50 realistic projects and 200 tasks."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing projects and tasks before seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["clear"]:
            Task.objects.all().delete()
            Project.objects.all().delete()
            self.stdout.write(self.style.WARNING("Cleared existing projects and tasks."))

        statuses = [choice[0] for choice in ProjectStatus.choices]
        priorities = [choice[0] for choice in TaskPriority.choices]
        today = date.today()

        projects = []
        for index in range(50):
            base_name = PROJECT_NAMES[index % len(PROJECT_NAMES)]
            suffix = f" #{index + 1}" if index >= len(PROJECT_NAMES) else ""
            project = Project(
                name=f"{base_name}{suffix}",
                description=f"Planning and delivery for {base_name}.",
                status=random.choice(statuses),
            )
            projects.append(project)

        Project.objects.bulk_create(projects)
        projects = list(Project.objects.order_by("id"))

        tasks = []
        for _ in range(200):
            project = random.choice(projects)
            offset_days = random.randint(-30, 60)
            due_date = today + timedelta(days=offset_days)
            tasks.append(
                Task(
                    title=random.choice(TASK_TITLES),
                    project=project,
                    assignee=random.choice(ASSIGNEES),
                    priority=random.choice(priorities),
                    due_date=due_date,
                    is_complete=random.random() < 0.35,
                )
            )

        Task.objects.bulk_create(tasks)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(projects)} projects and {len(tasks)} tasks successfully."
            )
        )
