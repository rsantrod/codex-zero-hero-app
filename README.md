# Codex: Zero to Hero App

This repository is the application used in my "Codex: Zero to Hero" series. It will grow into a personal finance application that serves as a real-world software engineering test bench for exploring how to work effectively with Codex.

The application will use fictional and sample financial data only. It is not intended to store or process real personal financial information.

## First Slice

This first working slice contains:

- Angular
- Spring Boot
- PostgreSQL
- Read-only REST endpoints for accounts and recent transactions
- Fictional seed data loaded by Flyway

It intentionally does not include authentication, budgets, imports, reporting, analytics, or CI/CD.

## Project Structure

```text
.
├── backend/            # Spring Boot API
├── frontend/           # Angular UI
└── docker-compose.yml  # Local PostgreSQL only
```

## Run Locally

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Start the backend:

```bash
cd backend
./mvnw spring-boot:run
```

Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

The Angular dev server proxies `/api` requests to the Spring Boot backend on `http://localhost:8080`.

## Useful Checks

Backend tests:

```bash
cd backend
./mvnw test
```

Frontend production build:

```bash
cd frontend
npm install
npm run build
```
