# 🛒 E-Commerce Application

A production-ready full-stack e-commerce application built with modern technologies.

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Frontend  | React · TypeScript · Vite · Tailwind CSS |
| Backend   | FastAPI · SQLAlchemy Async · Alembic     |
| Database  | PostgreSQL 16                       |
| DevOps    | Docker · docker-compose             |

## Project Structure

```
ecommerce-app/
├── frontend/          # React SPA
│   └── src/
│       ├── api/       # API client & endpoint modules
│       ├── components/# Reusable UI components
│       ├── contexts/  # React context providers
│       ├── hooks/     # Custom React hooks
│       ├── pages/     # Route-level page components
│       ├── routes/    # Router configuration
│       ├── types/     # TypeScript type definitions
│       └── utils/     # Helper utilities
├── backend/           # FastAPI server
│   ├── alembic/       # Database migrations
│   └── app/
│       ├── api/v1/    # Versioned API endpoints
│       ├── core/      # Security, exceptions, middleware
│       ├── models/    # SQLAlchemy ORM models
│       ├── repositories/ # Data access layer
│       ├── schemas/   # Pydantic request/response schemas
│       ├── services/  # Business logic layer
│       └── utils/     # Backend utilities
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker & docker-compose
- Node.js ≥ 18 (for local frontend development)
- Python ≥ 3.11 (for local backend development)

### Quick Start

```bash
# 1. Clone & configure
cp .env.example .env

# 2. Start all services
docker-compose up --build

# 3. Access the app
#    Frontend → http://localhost:5173
#    Backend  → http://localhost:8000
#    API Docs → http://localhost:8000/docs
```

### Local Development

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Features

- **Full E-Commerce Flow**: Product browsing, cart management, checkout with Stripe/Razorpay.
- **Admin Dashboard**: Manage users, products, categories, and orders.
- **Production Polished UI**: Graceful error boundaries, toast notifications, responsive design, and loading states.
- **Dockerized**: Easy setup with Docker Compose.
- **Clean Architecture**: Backend organized into models, schemas, repositories, and services.

## Architecture

This project follows **Clean Architecture** principles:

- **Routes / Endpoints** → HTTP layer (request handling, validation)
- **Services** → Business logic (orchestration, rules)
- **Repositories** → Data access (database queries)
- **Models** → ORM entities
- **Schemas** → Data transfer objects (Pydantic)

## License

MIT
