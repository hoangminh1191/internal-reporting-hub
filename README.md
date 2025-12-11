# Internal Reporting Hub

A centralized reporting management system for corporate environments, featuring role-based access, submission workflows, and aggregation dashboards.

![Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## Features

- **Department Management**: Organize users and reports by department.
- **Report Definitions**: Create dynamic report structures (JSON-based).
- **Submissions**: Fill out, validate, and submit reports.
- **Workflow**: Submit -> Approve/Reject flow.
- **Dashboard**: Visual aggregation of report status and metrics.

## Tech Stack

- **Client**: React (Vite), TypeScript, TailwindCSS.
- **Server**: Node.js, Express, Prisma (MySQL).

## Prerequisites

- Node.js (v18+)
- MySQL Server

## Setup Instructions

### 1. Database Setup

Ensure your MySQL server is running and you have a database created (e.g., `internal_reporting`).

### 2. Server Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

```bash
cp .env.example .env
```
Edit `.env` and set your `DATABASE_URL`:
`DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"`

Run database migrations:

```bash
npx prisma migrate dev --name init
```

Seed the database (Demo Data):

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```
The server will start on `http://localhost:3001`.

### 3. Client Setup

Open a new terminal and navigate to the root directory:

```bash
cd ..
# or if starting fresh
cd internal-reporting-hub
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open your browser at the URL shown (usually `http://localhost:5173`).

## Login Credentials (Demo)

The system is seeded with demo users. You can use the "Mode Demo Developers" toggle on the login screen to quickly login as:

- **Admin/Director**: Checking dashboard and approvals.
- **Manager**: Managing department reports.
- **Employee**: Submitting reports.

Or use standard credentials:
- **Email**: `a.nguyen@company.com` (and others as seeded)
- **Password**: `123456`
