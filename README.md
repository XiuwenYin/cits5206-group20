# Ground Support Testing Data System

**CITS5206 Capstone Project — Group 20**
**Client:** Matthew Heinsen Egan, Australian Centre for Geomechanics

A web-based platform for managing, visualising, and approving rock bolt ground support testing data. Engineers can browse bolt products and compare force-displacement test curves; administrators can upload, review, and approve test data before public release.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Team](#team)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## Project Overview

The system allows:

- **Public users** to browse rock bolt products, filter by supplier/category/methodology, and view force-displacement test curves with summary statistics.
- **Administrators** to log in securely, upload test data (JSON/CSV), and approve or reject records before they are made publicly visible.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.9, Django 4.2, Django REST Framework |
| Authentication | JWT via djangorestframework-simplejwt |
| Database | PostgreSQL 17 |
| Frontend | React 18, React Router v6, Vite |
| Charts | Recharts |
| Dev Tools | python-dotenv, django-cors-headers |

---

## Team

| Name | Role |
|------|------|
| Arthur Zhang | Backend Developer (API / Statistics) |
| Chenxiao Jiang | Frontend Developer (Admin UI) |
| Leo Yuan | Frontend Developer (Product Listing / Charts) |
| Luka Stjepanovic | Backend Developer / Database |
| Xiuwen Yin | Project Manager / Client Liaison / Backend |

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 17
- Git

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/XiuwenYin/cits5206-group20.git
cd cits5206-group20

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and secret key

# 5. Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE cits5206_db;"

# 6. Run migrations
python manage.py migrate

# 7. Create an admin superuser
python manage.py createsuperuser

# 8. Start the development server
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

### Frontend Setup

```bash
# From the project root
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

> **Note:** Both backend and frontend must be running simultaneously for full functionality.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the following:

```
SECRET_KEY=your-django-secret-key
DB_NAME=cits5206_db
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/token/` | Obtain JWT access and refresh tokens |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/check/` | Verify current user is authenticated |

### Bolt Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bolts/products/` | List and filter bolt products |
| GET | `/api/bolts/tests/<id>/statistics/` | Get curve statistics for a test |
| GET | `/api/bolts/tests/<id>/curve-data/` | Get raw force-displacement data |
| GET | `/api/bolts/tests/pending/` | List unapproved test records (admin only) |
| POST | `/api/bolts/tests/<id>/approve/` | Approve a test record (admin only) |
| POST | `/api/bolts/tests/<id>/reject/` | Reject a test record (admin only) |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/` | Upload products.json + tests.json or curve CSV (admin only) |

**Filter parameters for `/api/bolts/products/`:**
- `supplier` — case-insensitive substring match
- `length` — exact match in metres
- `category` — category name or ID
- `methodology` — `static` or `dynamic`

---

## Project Structure

```
cits5206-group20/
├── accounts/           # JWT authentication views and URLs
├── backend/            # Django project settings and main URLs
├── bolts/              # Bolt/Test/CurveData models, API views, serializers
├── uploads/            # File upload and parsing logic
├── src/                # React frontend
│   ├── api/            # API call functions
│   ├── components/     # Shared components (ProtectedRoute etc.)
│   ├── context/        # AuthContext for JWT token management
│   └── pages/
│       ├── ProductListingPage.jsx
│       └── admin/
│           ├── LoginPage.jsx
│           ├── DashboardPage.jsx
│           ├── UploadPage.jsx
│           └── ReviewPage.jsx
├── data/               # Sample data files
├── docs/               # Project documentation
├── .env.example        # Environment variable template
├── manage.py
└── requirements.txt
```

---

## Contributing

This project follows a feature-branch workflow:

1. Pick up an issue from the [project board](https://github.com/users/XiuwenYin/projects/1/views/1)
2. Create a branch: `git checkout -b feat/issue-<number>-description`
3. Make your changes and commit with descriptive messages (`feat:`, `fix:`, `chore:`)
4. Open a Pull Request and request review from a teammate
5. Wait for approval before merging into `main`

All PRs should be linked to their corresponding issue and milestone.
