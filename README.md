# Candidate Recruitment Portal — Full-Stack Testing Project

A clean, modern, standalone full-stack recruitment application form built with React, TypeScript, Fastify, Prisma ORM, and Neon PostgreSQL.

---

## 🌟 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js (v24), TypeScript, Fastify v4, CORS |
| **Database** | Neon PostgreSQL (Serverless Cloud Database) |
| **ORM** | Prisma ORM v5 (Schema, Migrations, Client) |

---

## 📁 Project Structure

```text
.
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   └── 20261109104756_init/
│   │   │       └── migration.sql       # SQL migration for Neon PostgreSQL
│   │   └── schema.prisma              # Prisma schema definition
│   ├── src/
│   │   ├── lib/
│   │   │   └── prisma.ts              # Singleton Prisma client instance
│   │   ├── routes/
│   │   │   ├── applications.ts        # POST /api/applications handler & validation
│   │   │   └── health.ts              # GET /api/health database connectivity check
│   │   ├── server.ts                  # Fastify server startup & graceful shutdown
│   │   └── test-runner.ts             # Automated 8-point verification test script
│   ├── .env                           # Backend environment variables
│   ├── .env.example                   # Backend environment placeholder template
│   ├── .gitignore                     # Git ignore rules for backend
│   ├── package.json                   # Backend dependencies & scripts
│   └── tsconfig.json                  # TypeScript compiler configuration
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts                 # Fetch API client for applications and health
│   │   ├── types.ts                   # TypeScript interfaces and types
│   │   ├── App.tsx                    # Main recruitment form & confirmation UI
│   │   ├── main.tsx                   # React root entrypoint
│   │   ├── index.css                  # Tailwind CSS root styling
│   │   └── vite-env.d.ts              # Vite environment variable type declarations
│   ├── index.html                     # HTML5 shell
│   ├── tailwind.config.js             # Tailwind CSS design system config
│   ├── postcss.config.js              # PostCSS plugins config
│   ├── vite.config.ts                 # Vite bundler configuration
│   ├── .env                           # Frontend environment variables
│   ├── .env.example                   # Frontend environment placeholder template
│   ├── .gitignore                     # Git ignore rules for frontend
│   ├── package.json                   # Frontend dependencies & scripts
│   └── tsconfig.json                  # Frontend TypeScript configuration
│
├── .gitignore                         # Project root git ignore
└── README.md                          # Full system documentation
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://username:password@ep-sample.region.aws.neon.tech/neondb?sslmode=require"
PORT=5001
NODE_ENV=development
```

> **Note on macOS Port 5000:** On macOS Monterey, Ventura, Sonoma, and Sequoia, port 5000 is occupied by the macOS AirPlay Receiver (`ControlCenter`). The backend defaults to `PORT=5001` (or automatically shifts if 5000 is in use) to prevent `EADDRINUSE` conflicts.

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5001
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites

- Node.js (v18+ or v24+ recommended)
- npm (v9+ or v11+)
- Neon PostgreSQL connection string

### 2. Backend Setup & Startup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment
# Ensure backend/.env exists with your Neon DATABASE_URL and PORT=5001

# 3. Apply Prisma migrations
npm run prisma:deploy

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Start the backend server (development mode with hot-reload)
npm run dev

# Or build and start production server
npm run build
npm start
```

Backend will be running at: **`http://localhost:5001`**

### 3. Frontend Setup & Startup

In a new terminal window:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment (points to backend at port 5001)
# Ensure frontend/.env has: VITE_API_URL=http://localhost:5001

# 3. Start Vite development server
npm run dev
```

Frontend application will open at: **`http://localhost:5173`**

---

## 📖 API Documentation

### 1. Health & Database Connectivity

- **Endpoint:** `GET /api/health`
- **Description:** Verifies server status and executes `SELECT 1` on the Neon PostgreSQL database to measure query latency.
- **Success Status:** `200 OK`

#### Response Example
```json
{
  "status": "ok",
  "uptime": 124.52,
  "timestamp": "2026-11-09T10:55:01.230Z",
  "database": {
    "status": "connected",
    "latencyMs": 85
  }
}
```

---

### 2. Submit Application

- **Endpoint:** `POST /api/applications`
- **Headers:** `Content-Type: application/json`
- **Description:** Validates and persists an application to PostgreSQL. Prevents duplicate submissions based on `email` and `registrationNumber`.

#### Request Body
```json
{
  "fullName": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "+1 555 123 4567",
  "registrationNumber": "REG2026101",
  "branch": "Computer Science & Engineering",
  "currentYear": "3rd",
  "preferredDepartment": "Technical",
  "motivation": "I am passionate about building full-stack web applications and scalable cloud systems.",
  "skills": "React, TypeScript, Fastify, Node.js, PostgreSQL",
  "github": "https://github.com/janedoe",
  "linkedin": "https://linkedin.com/in/janedoe"
}
```

#### Field Specifications & Validation Rules

| Field | Type | Required | Validation Rule |
|---|---|---|---|
| `fullName` | String | Yes | Trimmed, 2 to 100 characters |
| `email` | String | Yes | Valid email format regex, unique in database |
| `phone` | String | Yes | Valid phone format regex, 10 to 15 digits |
| `registrationNumber` | String | Yes | Trimmed, 2 to 30 characters, unique in database |
| `branch` | String | Yes | Non-empty selection |
| `currentYear` | String | Yes | One of: `1st`, `2nd`, `3rd`, `4th` |
| `preferredDepartment` | String | Yes | One of: `Technical`, `Web Development`, `Design`, `Marketing`, `Management`, `Content` |
| `motivation` | String | Yes | Minimum 10 characters, maximum 2000 characters |
| `skills` | String | Yes | Minimum 2 characters, maximum 1000 characters |
| `github` | String | No | Valid URL if provided |
| `linkedin` | String | No | Valid URL if provided |

#### Responses

- **`201 Created`** (Success)
  ```json
  {
    "success": true,
    "message": "Application submitted successfully!",
    "data": {
      "id": "fe5787cc-d68d-4fe2-81e8-dc1c1122a34b",
      "fullName": "Jane Doe",
      "email": "jane.doe@example.com",
      "registrationNumber": "REG2026101",
      "branch": "Computer Science & Engineering",
      "currentYear": "3rd",
      "preferredDepartment": "Technical",
      "createdAt": "2026-11-09T10:55:01.230Z"
    }
  }
  ```

- **`400 Bad Request`** (Validation Failure)
  ```json
  {
    "success": false,
    "message": "Validation failed. Please correct the highlighted fields.",
    "errors": {
      "email": "Please provide a valid email address.",
      "phone": "Please provide a valid phone number (10-15 digits)."
    }
  }
  ```

- **`409 Conflict`** (Duplicate Email or Registration Number)
  ```json
  {
    "success": false,
    "message": "An application with this email address has already been submitted.",
    "field": "email"
  }
  ```

- **`500 Internal Server Error`** (Unexpected Database / Server Error)
  ```json
  {
    "success": false,
    "message": "An unexpected database error occurred while submitting your application. Please try again later."
  }
  ```

---

## 🗄️ Database Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Application {
  id                  String   @id @default(uuid())
  fullName            String
  email               String   @unique
  phone               String
  registrationNumber  String   @unique
  branch              String
  currentYear         String
  preferredDepartment String
  motivation          String
  skills              String
  github              String?
  linkedin            String?
  createdAt           DateTime @default(now())

  @@map("applications")
}
```

---

## 🧪 Automated Verification & Testing

An automated verification test runner (`backend/src/test-runner.ts`) is included to verify all 8 requirements.

### Run Verification Suite

Make sure both backend and frontend servers are running, then run:

```bash
cd backend
npm run test:verify
```

### Execution Results

```text
🧪 Starting Recruitment System Automated Verification Tests...

======================================================================
                    TEST EXECUTION SUMMARY
======================================================================
✅ PASS | 1. Frontend runs successfully on port 5173
✅ PASS | 2. Backend starts and responds successfully on port 5001
✅ PASS | 3. Health endpoint verifies backend and Neon PostgreSQL connectivity
         └─ Latency: 1124ms
✅ PASS | 4. Valid form submission stores record in Neon PostgreSQL
         └─ Created ID: 0765bd6b-8830-4a68-923c-e63545f0d38e
✅ PASS | 5. Duplicate email rejection (HTTP 409 Conflict)
         └─ An application with this email address has already been submitted.
✅ PASS | 6. Duplicate registration number rejection (HTTP 409 Conflict)
         └─ An application with this registration number has already been submitted.
✅ PASS | 7. Invalid submissions rejected with detailed validation errors (HTTP 400)
         └─ Validated 10 invalid fields
✅ PASS | 8. Graceful database error handling (Prisma P2002 conflict & 500 recovery)
         └─ Handled in applicationRoutes with Prisma.PrismaClientKnownRequestError and 503 on health check
======================================================================
🎉 ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY!
```
