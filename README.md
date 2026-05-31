<div align="center">
  <h1>🛒 Full Stack E-Commerce Platform</h1>
  
  <p><strong>Enterprise-grade, scalable, and automation-ready E-Commerce solution.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright" />
  </p>
</div>

---

## 🌟 Overview

This is a comprehensive, production-ready Full Stack E-Commerce platform. It features a modern, responsive React frontend tailored with Tailwind CSS and a high-performance asynchronous FastAPI backend powered by PostgreSQL. 

The repository is built with enterprise quality in mind, featuring extensive Playwright UI and API automation frameworks, comprehensive documentation, and robust Docker integration.

---

## ✨ Features

### 🛍️ Customer Features
* **User Authentication**: Secure JWT-based registration and login.
* **Product Discovery**: Advanced search, filtering, and detailed product views.
* **Wishlist**: Save favorite products for later.
* **Shopping Cart**: Real-time cart management and total calculations.
* **Address Management**: Save and manage multiple delivery addresses.
* **Checkout & Payments**: Seamless checkout flow with support for multiple payment methods and coupon applications.
* **Order Tracking**: Order history and status tracking.
* **Reviews & Ratings**: Share feedback on purchased products.
* **Responsive Design**: Flawless experience across desktop, tablet, and mobile devices.

### ⚙️ Admin Features
* **Dashboard**: Comprehensive analytics and store statistics.
* **Product Management**: Full CRUD operations for the product catalog.
* **Category Management**: Organize products into logical categories.
* **Order Management**: Monitor and update customer order statuses.
* **User Management**: View and manage registered users.

---

## 🤖 Automation Testing

This project is fully instrumented for end-to-end quality assurance, making it an ideal candidate for CI/CD pipelines and QA demonstrations.

### Playwright UI Automation
* **Stable Locators**: Entire application utilizes robust `data-testid` attributes.
* **Page Object Model (POM)**: Highly maintainable abstractions for page interactions.
* **E2E Framework**: Covers critical user journeys including checkout funnels and admin operations.
* **Locator Documentation**: Centralized dictionary of all UI locators for easy reference.

### Playwright API Automation
* **API Testing Framework**: Direct backend integration testing using `APIRequestContext`.
* **API Clients**: Reusable, typed clients for every API domain (Auth, Products, Cart, etc.).
* **Schema Validation**: Strict validation of API responses using Zod schemas.
* **Data Builders**: Dynamic test data generation using Faker for isolated, idempotent tests.
* **Endpoint Coverage**: Comprehensive coverage across 8+ major API modules.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Backend** | FastAPI, Python, SQLAlchemy (Async), Alembic |
| **Database** | PostgreSQL |
| **DevOps** | Docker, Docker Compose |
| **Automation** | Playwright (UI & API), Zod, Faker |

---

## 📁 Project Structure

```text
ecommerce-app/
├── backend/                  # FastAPI Application
│   ├── app/                  # Application code (API, Models, Schemas, CRUD)
│   ├── alembic/              # Database migrations
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React Application
│   ├── src/                  # React components, pages, API hooks, store
│   ├── public/               # Static assets
│   └── package.json          # Node dependencies
├── tests/                    # Playwright Automation Framework
│   ├── e2e/                  # UI End-to-End Tests
│   ├── pages/                # Page Object Models (POM)
│   └── api/                  # API Tests, Clients, Builders, Schemas
├── docs/                     # Documentation
│   ├── api-endpoints-inventory.md
│   ├── api-testing-guide.md
│   ├── playwright-locators.md
│   └── playwright-test-scenarios.md
└── docker-compose.yml        # Multi-container orchestration
```

---

## 📸 Screenshots

### Home Page
> *![Home Page Placeholder](https://via.placeholder.com/800x400?text=Home+Page)*

### Products Page
> *![Products Page Placeholder](https://via.placeholder.com/800x400?text=Products+Page)*

### Product Details
> *![Product Details Placeholder](https://via.placeholder.com/800x400?text=Product+Details)*

### Cart & Checkout
> *![Cart Placeholder](https://via.placeholder.com/800x400?text=Shopping+Cart)*
> *![Checkout Placeholder](https://via.placeholder.com/800x400?text=Checkout+Flow)*

### Admin Dashboard
> *![Admin Dashboard Placeholder](https://via.placeholder.com/800x400?text=Admin+Dashboard)*

### Swagger Docs
> *![Swagger Placeholder](https://via.placeholder.com/800x400?text=FastAPI+Swagger+UI)*

---

## 🚀 Installation

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* PostgreSQL

### Database Setup
1. Create a PostgreSQL database (e.g., `ecommerce_db`).
2. Update the connection string in `backend/.env`.

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head      # Run migrations
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker Setup

The easiest way to run the entire stack (Database, Backend, Frontend) is via Docker Compose:

```bash
# Build and start all containers in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## 📖 API Documentation

Once the backend is running, FastAPI automatically generates interactive documentation:

* **Swagger UI**: `http://localhost:8000/docs`
* **ReDoc**: `http://localhost:8000/redoc`

**Reference**: Review our [API Endpoints Inventory](docs/api-endpoints-inventory.md) for a high-level breakdown.

---

## 🧪 Automation Documentation

Our testing architecture is fully documented. Refer to these guides for maintaining or extending the test suites:

* [Playwright Locators Dictionary](docs/playwright-locators.md)
* [Playwright Test Scenarios](docs/playwright-test-scenarios.md)
* [API Testing Guide](docs/api-testing-guide.md)
* [Automation Readiness Report](docs/automation-readiness-report.md)

---

## 🏃 Running Tests

Ensure all dependencies are installed and the application is running locally before executing tests.

### Playwright UI Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all UI E2E tests
npx playwright test

# Run UI tests with UI mode
npx playwright test --ui
```

### Playwright API Tests
```bash
# Run API validation tests using the dedicated config
npx playwright test -c playwright.api.config.ts
```

---

## 🌍 Deployment

This architecture is optimized for modern cloud deployments:

* **Frontend**: [Vercel](https://vercel.com/) (Recommended for Vite/React)
* **Backend**: [Render](https://render.com/) or Railway (Docker/Python support)
* **Database**: [Neon](https://neon.tech/) or Supabase (Serverless Postgres)

---

## 🔮 Future Enhancements

- [ ] Payment Gateway Integration (Stripe/Razorpay Live Environment)
- [ ] Automated Email Notifications (SendGrid/AWS SES)
- [ ] Cloud Image Upload Integration (AWS S3/Cloudinary)
- [ ] Fully Automated CI/CD Pipeline via GitHub Actions
- [ ] Application Performance Monitoring (Sentry/Datadog)

---

## 👨‍💻 Author

**Sourabh Shivaji Patil**

* **GitHub**: [@sourabhpatil1010](https://github.com/sourabhpatil1010)
* **Email**: [sourabhpatil0543@gmail.com](mailto:sourabhpatil0543@gmail.com)

---
<div align="center">
  <i>Built with ❤️ for scalable e-commerce.</i>
</div>
