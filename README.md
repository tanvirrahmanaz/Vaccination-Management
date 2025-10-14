# Ishanvai Monorepo

This workspace now contains both the React dashboard and the Django REST backend for the Vaccination Management System.

## Structure
- `client/` – Vite + React single-page app. Run `npm install && npm run dev` inside this folder for local development.
- `server/` – Django 5 + DRF project cloned from `https://github.com/Ishan-shahnan/Vaccination-Management-System.git`.

## Backend Quick Start (`server/`)
1. `cd server`
2. Create a virtual environment
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```
4. Apply migrations and start the API
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

Key endpoints:
- API root: `http://127.0.0.1:8000/api/`
- Swagger UI: `http://127.0.0.1:8000/api/docs/`
- Auth: `/api/auth/token/`, `/api/auth/users/login/`, `/api/auth/users/register/` and more as documented in `server/README.md`.

## Frontend Quick Start (`client/`)
1. `cd client`
2. `npm install`
3. `npm run dev`

Update the `VITE_API_BASE` value in `client/.env` to match the local Django server when running both sides together.
