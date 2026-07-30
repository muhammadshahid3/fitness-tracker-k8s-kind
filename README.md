# Pulse — Personal Fitness Tracker (MERN Stack)

A full-stack fitness tracking application: workouts, nutrition, weight, water,
sleep, goals, progress reports, and an admin panel — built with MongoDB,
Express, React, and Node.

## Project Structure

```
fitness-tracker/
├── docker-compose.yml   Orchestrates mongo + backend + frontend
├── .env.example          Docker Compose environment overrides
├── backend/          Express + MongoDB REST API
│   ├── Dockerfile
│   ├── config/        DB connection
│   ├── models/        Mongoose schemas (8 collections)
│   ├── controllers/    Route handlers / business logic
│   ├── routes/         Express routers
│   ├── middleware/     Auth, validation, error handling, file upload
│   ├── utils/           JWT, email, admin seed script
│   └── server.js        App entry point
└── frontend/          React (Vite) SPA
    ├── Dockerfile        Multi-stage build, served via nginx
    ├── nginx.conf         SPA routing + reverse proxy to backend
    └── src/
        ├── api/          Axios client + endpoint functions
        ├── context/       Auth & theme (dark/light) providers
        ├── components/    Reusable UI, layout, dashboard, chart components
        ├── pages/         Feature pages (auth, dashboard, workouts, etc.)
        └── routes/        Route guards (protected / admin / guest)
```

## Prerequisites

- Node.js 18+
- A MongoDB instance (local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

## 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/fitness_tracker
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

SMTP fields are optional — if left blank, "forgot password" emails are logged
to the console (and returned in the API response in dev mode) instead of
actually being sent, so the flow still works without email configured.

Start the API:

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start
```

The API runs at `http://localhost:5000/api`. Health check: `GET /api/health`.

### Create an admin account

```bash
node utils/seedAdmin.js
```

Creates `admin@fitnesstracker.com` / `Admin@123` (override via `ADMIN_EMAIL`
/ `ADMIN_PASSWORD` env vars). Log in with this account to access `/admin`.

## 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173` and expects the API at the URL set in
`VITE_API_URL` (defaults to `http://localhost:5000/api`).

## Features

- **Auth:** register, login, forgot/reset password, change password, JWT sessions
- **Dashboard:** calories in/out, water, weight, BMI, daily fitness score, weekly charts
- **Workouts:** full CRUD, category filter, search, pagination
- **Diet Tracker:** meals by type, daily macro breakdown, nutrition summary
- **Weight Tracking:** history, trend chart, goal progress %
- **Water Intake:** quick-add, daily goal, 7-day history chart
- **Sleep Tracking:** hours + quality, weekly report
- **Goals:** weight loss/gain, muscle gain, maintain — with progress tracking
- **Reports:** weekly/monthly workout stats, calories, weight, and goal reports
- **Admin Panel:** system stats, user search, block/unblock, delete
- **UI:** responsive sidebar layout, dark/light mode, toast notifications,
  loading states, empty states, confirm dialogs

## Notes on Notifications

In-app notifications (goal achievement, etc.) are stored and shown in the
bell menu in the top bar. Scheduled push/email reminders (daily workout,
water reminders) are represented via the `notificationPrefs` fields on the
user profile as a foundation — wiring them to a real push/cron/email service
is straightforward to add on top of the existing `Notification` model and
`sendEmail` util, but is infrastructure-dependent (e.g. a job scheduler or
push provider) so it's left as the next step for a production deployment.

## Running with Docker

The project includes a `Dockerfile` for each service plus a root
`docker-compose.yml` that runs the whole stack: MongoDB, the API, and the
frontend (built and served via nginx, which also reverse-proxies `/api` and
`/uploads` to the backend so the SPA and API share one origin).

```bash
cp .env.example .env   # optional — override JWT secret, SMTP, admin seed creds
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API directly: http://localhost:5000/api
- MongoDB: exposed on localhost:27017 if you want to connect with a GUI

Create an admin account inside the running backend container:

```bash
docker compose exec backend node utils/seedAdmin.js
```

Data persists across restarts via named volumes: `mongo_data` (database) and
`backend_uploads` (profile pictures). To stop and remove containers (keeping
data): `docker compose down`. To also wipe data: `docker compose down -v`.

### Building/running a single service

```bash
docker build -t fitness-tracker-backend ./backend
docker build -t fitness-tracker-frontend ./frontend
```

The frontend image bakes `VITE_API_URL`/`VITE_API_ORIGIN` in at build time
(see `frontend/Dockerfile` build args) since Vite env vars are compiled into
the static bundle — pass `--build-arg VITE_API_URL=https://your-api.com/api`
if you're not using the bundled nginx proxy.

## Tech Stack

Frontend: React 19, React Router, Tailwind CSS, Recharts, Axios, react-hot-toast, lucide-react
Backend: Express, Mongoose, JWT, bcryptjs, express-validator, multer, nodemailer
# fitness-tracker-k8s-kind
