# TaskFlow — One-Command Setup (PowerShell)

Run from the project root: `c:\codebases\uplers-test`

## First-time setup

```powershell
# 1. Start PostgreSQL (port 5433 to avoid local Postgres conflicts)
docker compose up -d

# 2. Backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
copy backend\.env.example backend\.env
cd backend
python manage.py migrate
python manage.py seed_data --clear
cd ..

# 3. Frontend
cd frontend
npm install
cd ..
```

## Run (two terminals)

**Terminal 1 — API:**
```powershell
cd c:\codebases\uplers-test
.\.venv\Scripts\Activate.ps1
python backend\manage.py runserver
```

**Terminal 2 — Frontend:**
```powershell
cd c:\codebases\uplers-test\frontend
npm run dev
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000/api/ |
| Admin | http://localhost:8000/admin/ |
| API Docs (browsable) | http://localhost:8000/api/projects/ |

## Optional: Create admin user

```powershell
python backend\manage.py createsuperuser
```
