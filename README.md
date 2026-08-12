# Military Asset Management System

Full-stack starter project containing both backend and frontend.

## Stack
- Frontend: React + Vite + Tailwind CSS + Axios + Lucide React
- Backend: Node.js + Express + PostgreSQL
- Authentication foundation: JWT + bcrypt dependencies included
- Database: PostgreSQL

## Run Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

On PowerShell, `copy` can be replaced with:
```powershell
Copy-Item .env.example .env
```

Backend runs at:
http://localhost:5000

Health check:
http://localhost:5000/api/health

## Run Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at the Vite URL shown in the terminal, normally:
http://localhost:5173

## PostgreSQL with Docker

```bash
docker run --name military-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=military_assets -p 5432:5432 -d postgres
```

Apply `backend/schema.sql` to the `military_assets` database.

## Current implementation
This is the complete project scaffold plus an initial functional dashboard shell. Authentication, RBAC, CRUD APIs, transactional transfers, audit logging and production deployment are the next implementation stages.
