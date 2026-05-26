# VedaAI

## Architecture Overview

VedaAI is a **full‑stack AI‑powered learning platform** built with a **Next.js** frontend and a **Node/Express** (or NestJS) backend. The key components are:

- **Frontend (`frontend/`)** – React with TypeScript, using **Next.js** for server‑side rendering and routing. UI components use **Tailwind CSS** (via PostCSS) and the **lucide‑react** icon set.
- **Backend (`backend/`)** – TypeScript **Express** server exposing REST APIs. Core services include:
  - `assignment.controller.ts` – CRUD for assignments.
  - `pdf.service.ts` – PDF generation and storage.
  - `openai.service.ts` – Wrapper around OpenAI API.
  - Queues with **BullMQ** backed by **Redis** for background processing.
- **Realtime layer** – WebSocket (`socket.ts`) using **socket.io** for live updates.
- **Data store** – **MongoDB** accessed via **Mongoose**.
- **Authentication** – JWT‑based auth with role‑based access control.

The architecture follows a **modular, service‑oriented** pattern, making it easy to extend with new AI tools or integrate additional micro‑services.

## Approach

1. **Clean UI first** – We trimmed the sidebar to keep only the core navigation (Assignments) and removed unused icons and routes. This reduces cognitive load and improves performance.
2. **Component‑driven development** – All UI pieces live in `frontend/src/components/`. Shared components like `ActionBar`, `Loader`, and `Sidebar` are reusable across pages.
3. **API‑first backend** – Controllers expose thin HTTP layers; business logic lives in services (`services/`). This separation aids testing and future scaling.
4. **Background processing** – Heavy tasks (PDF creation, AI generation) run in queues (`queues/`) so the UI remains responsive.
5. **Real‑time feedback** – WebSocket events keep the dashboard in sync without full page reloads.
6. **Developer experience** – Both the frontend and backend use **TypeScript** for static safety, and `npm run dev` runs them concurrently for rapid iteration.
## Project Structure

- **frontend/** – Next.js React app
  - `src/app/` – Route handlers and pages
  - `src/components/` – Re‑usable UI components (Sidebar, ActionBar, Loader, etc.)
  - `src/services/` – API client wrappers (e.g., socket connection)
- **backend/** – Express API server
  - `src/config/` – Database and Redis connection utilities
  - `src/controllers/` – Request handlers (assignments, assessments)
  - `src/services/` – Business logic (OpenAI, PDF generation)
  - `src/queues/` & `src/workers/` – BullMQ queues and workers for async jobs
  - `src/sockets/` – Socket.io real‑time handlers
  - `src/middleware/` – Error handling, validation, auth middleware
- **public/** – Static assets served by both front‑ and back‑end (e.g., generated PDFs)
- **.env.example** – Sample environment configuration

---
---

## Setup & Usage

### Prerequisites
- **Node.js** (v18+)
- **npm** (v9+)
- **Docker** (optional, for PostgreSQL)

### Backend
1. Navigate to the backend folder: `cd backend`.
2. Install dependencies: `npm install`.
3. Copy the example environment file and set your variables:
   ```bash
   cp .env.example .env
   # Edit .env to configure DB connection and OpenAI keys
   ```
4. Start the backend (development mode):
   ```bash
   npm run dev
   ```

### Frontend
1. Open a new terminal and navigate to the frontend folder: `cd frontend`.
2. Install dependencies: `npm install`.
3. Start the frontend:
   ```bash
   npm run dev
   ```

The application will be available at **http://localhost:3000**. The backend API runs on **http://localhost:4000** (adjust if configured otherwise).

### Usage
- Log in with your credentials (or use the default demo user).
- Navigate the dashboard to create assignments, view groups, and explore the AI Toolkit.
- The sidebar now only shows the **Assignments** section.

Feel free to expand this README with contribution guidelines and deployment instructions.

## Deployment

**Frontend (Next.js)** – Deploy to **Vercel** for optimal edge caching, automatic builds, and preview URLs.

**Backend (Express + BullMQ + Redis)** – Deploy to **Render** (or any Docker‑compatible host) because it supports background workers, persistent services, and custom domain configuration. Render can also host a MongoDB instance if needed.

**Combined approach** – You can host the frontend on Vercel and the backend on Render, connecting them via environment variables (e.g., `API_URL`). Ensure CORS is configured accordingly.

**Why not Vercel for the whole stack?** Vercel’s serverless functions have execution limits and do not natively support long‑running processes like BullMQ workers or WebSockets. Render provides dedicated containers and managed Redis, making it a better fit for the backend components.
