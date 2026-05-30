# 🛒 E-Commerce Application

A production-ready full-stack e-commerce application built with modern technologies.

## 🚀 Project Overview

**Why this project was built:**
This project serves as a comprehensive demonstration of a modern, scalable e-commerce platform. It was built to showcase best practices in full-stack development, including secure authentication, efficient database management, and a responsive, user-friendly interface.

**Main Business Features:**
- Seamless shopping experience with a robust cart and checkout system.
- Comprehensive user profile management including multiple addresses and order history.
- Advanced product discovery through search, filtering, and categorization.
- Customer engagement tools like product reviews, ratings, and wishlists.
- Powerful admin tools for inventory, user, and order management.

**Technical Highlights:**
- **Clean Architecture:** Backend organized into models, schemas, repositories, and services for high maintainability.
- **Asynchronous Operations:** Utilizing FastAPI and SQLAlchemy Async for high-performance non-blocking database operations.
- **Modern Frontend:** Built with React, TypeScript, and Vite for a fast and type-safe development experience.
- **Containerization:** Fully dockerized backend, frontend, and database services for consistent development and deployment environments.
- **Secure Authentication:** Implementation of robust JWT-based authentication and authorization.

## 📸 Screenshots

| Home Page | Products Page | Product Details |
| :---: | :---: | :---: |
| ![Home](https://via.placeholder.com/400x250?text=Home+Page) | ![Products](https://via.placeholder.com/400x250?text=Products+Page) | ![Product Details](https://via.placeholder.com/400x250?text=Product+Details) |

| Shopping Cart | Checkout | Admin Dashboard |
| :---: | :---: | :---: |
| ![Cart](https://via.placeholder.com/400x250?text=Shopping+Cart) | ![Checkout](https://via.placeholder.com/400x250?text=Checkout+Process) | ![Dashboard](https://via.placeholder.com/400x250?text=Admin+Dashboard) |

*(Note: Replace placeholder image URLs with actual screenshots of the application.)*

## 🌟 Key Features

* **🔐 Authentication & Authorization:** Secure user registration, login, and role-based access control (Admin vs. Customer) using JWT.
* **🛍️ Product Management:** Detailed product listings, multiple images, inventory tracking, and categorical organization.
* **❤️ Wishlist:** Users can save favorite products for future purchases.
* **⭐ Reviews & Ratings:** Customers can leave feedback and rate products they have purchased.
* **📦 Order Management:** Complete checkout flow, order history tracking, and status updates.
* **📊 Admin Dashboard:** Centralized control panel for managing users, products, categories, coupons, and monitoring sales.
* **🔍 Search & Filtering:** Efficient product discovery with text search and category filters.
* **📱 Responsive Design:** Fully responsive UI built with Tailwind CSS, ensuring a seamless experience across desktop, tablet, and mobile devices.
* **🎟️ Coupons & Discounts:** System for admins to create promotional codes and for users to apply them during checkout.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) |
| **Backend** | ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) |
| **Database** | ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-%23D71F00.svg?style=for-the-badge&logo=sqlalchemy&logoColor=white) ![Alembic](https://img.shields.io/badge/Alembic-Migrations-blue?style=for-the-badge) |
| **DevOps** | ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Docker Compose](https://img.shields.io/badge/Docker%20Compose-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) |

## 🏗️ Architecture Overview

This project strictly adheres to **Clean Architecture** principles to separate concerns, improve maintainability, and facilitate testing.

- **Endpoints/Routes (`api/v1/`):** The presentation layer that handles HTTP requests, input validation, and routing.
- **Services (`services/`):** The core business logic layer. It orchestrates operations, applies business rules, and communicates with repositories.
- **Repositories (`repositories/`):** The data access layer abstracting database operations, ensuring the business logic remains database-agnostic.
- **Models (`models/`):** SQLAlchemy ORM entities representing the database schema.
- **Schemas (`schemas/`):** Pydantic models defining data transfer objects (DTOs) for request/response validation and serialization.

## 📁 Folder Structure

```text
ecommerce-app/
├── backend/                  # FastAPI Server
│   ├── alembic/              # Database migration scripts
│   ├── alembic.ini           # Alembic configuration
│   ├── app/                  # Main application code
│   │   ├── api/v1/endpoints/ # API route controllers (auth, products, orders, etc.)
│   │   ├── core/             # Application configuration and security
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── repositories/     # Data access layer
│   │   ├── schemas/          # Pydantic data validation schemas
│   │   ├── services/         # Business logic implementation
│   │   └── utils/            # Helper functions
│   ├── scripts/              # Utility scripts for DB management
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Backend Docker image definition
├── frontend/                 # React SPA
│   ├── src/                  
│   │   ├── api/              # Axios configuration and API service calls
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React Context (Auth, Cart)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page-level components (Home, Products, Admin, etc.)
│   │   ├── routes/           # Application routing configuration
│   │   ├── types/            # TypeScript interface definitions
│   │   └── utils/            # Helper formatting/calculation functions
│   ├── package.json          # Node.js dependencies
│   ├── tailwind.config.ts    # Tailwind CSS configuration
│   ├── vite.config.ts        # Vite configuration
│   └── Dockerfile            # Frontend Docker image definition
└── docker-compose.yml        # Multi-container orchestration
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.11
- PostgreSQL 16 (if running locally without Docker)
- Docker & Docker Compose

### Environment Variables Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Update the `.env` file with your specific configurations (e.g., database credentials, secret keys, Stripe/Razorpay keys).

### 🐳 Docker Setup (Recommended)

The easiest way to run the application is using Docker.

```bash
# Build and start all services (Frontend, Backend, Database)
docker-compose up --build

# To run in detached mode:
docker-compose up -d
```

### 💻 Local Development Setup

If you prefer to run the services individually on your host machine:

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/macOS
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations:
   ```bash
   alembic upgrade head
   ```
5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *(Server runs on http://localhost:8000)*

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *(App runs on http://localhost:5173)*

### 🗄️ Database Migration Commands

This project uses Alembic for database migrations.

```bash
cd backend
# Generate a new migration script based on model changes
alembic revision --autogenerate -m "Description of changes"

# Apply migrations to the database
alembic upgrade head

# Rollback the last migration
alembic downgrade -1
```

## 📚 API Documentation

FastAPI automatically generates interactive API documentation. Once the backend server is running, you can access:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## 🔐 Authentication Overview

- Uses **JWT (JSON Web Tokens)** for secure, stateless authentication.
- Passwords are securely hashed using **bcrypt**.
- The frontend securely stores the token and attaches it as a Bearer token in the Authorization header for protected API requests.
- Endpoints are protected using FastAPI's dependency injection (`Depends(get_current_user)`).

## 🛡️ Admin Panel Overview

The Admin Dashboard provides comprehensive management capabilities:
- **Overview:** High-level metrics, total sales, active users, and recent orders.
- **Products Management:** Add, edit, delete products, and manage multiple product images.
- **Categories:** Organize products efficiently.
- **Coupons:** Create and manage discount codes for promotional campaigns.
- **Users:** View registered users and manage their roles.
- *(Accessible only to users with the `is_superuser` flag in the database)*

## 🚀 Future Enhancements

- **Payment Gateway Integration:** Finalize Stripe/Razorpay integration for processing real transactions.
- **Email Notifications:** Implement automated emails for order confirmations, password resets, and shipping updates.
- **Advanced Analytics:** Integrate more detailed sales reporting and user behavior tracking in the admin dashboard.
- **Inventory Alerts:** Automated notifications when product stock falls below a certain threshold.

## ✍️ Author

Created with ❤️ by **[Sourabh Patil]**

* [GitHub Profile](https://github.com/sourabhpatil1010)
