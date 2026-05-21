# TaskFlow — Team Task Manager

A full-stack web app for managing team projects and tasks with role-based access control.

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Atlas) |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Railway |

---

## ✨ Features

- **Authentication** — Signup, Login, JWT-based sessions
- **Role-Based Access (Admin / Member)**
  - Admin: Create/edit/delete projects, tasks, manage team members
  - Member: View assigned tasks, update task status only
- **Project Management** — Create, edit, delete projects with member assignment
- **Task Management** — Create tasks with priority, due date, assignment
- **Kanban Board** — Visual task board per project (Todo / In Progress / Done)
- **Dashboard** — Stats overview, overdue tracking, recent projects
- **Team Management** — Admin can view/edit roles and remove users
- **Overdue Detection** — Highlights tasks past their due date

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleCheck.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── TaskCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   ├── ProjectDetail.jsx
    │   │   └── Team.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier works)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd team-task-manager

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskmanager
JWT_SECRET=any_long_random_string_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Environment (for production)

Create `frontend/.env`:
```
VITE_API_URL=https://your-backend.railway.app/api
```

For local dev, the Vite proxy handles `/api` → `localhost:5000` automatically.

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open: http://localhost:5173

---

## 🔌 REST API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get token |
| GET | `/api/auth/me` | Private | Get current user |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Private | Get all projects |
| GET | `/api/projects/:id` | Private | Get single project |
| POST | `/api/projects` | Admin | Create project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Private | Get tasks (filtered) |
| GET | `/api/tasks/:id` | Private | Get single task |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Private | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | Get all users |
| GET | `/api/users/members` | Admin | Get all members |
| PUT | `/api/users/:id/role` | Admin | Update user role |
| DELETE | `/api/users/:id` | Admin | Remove user |

---

## 🚂 Deploy on Render

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/team-task-manager.git
git push -u origin main
```

### Step 2 — Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project → Deploy from GitHub repo**
3. Select your repo
4. Click **Add Service → Add Variables**:
   ```
   MONGODB_URI = mongodb+srv://...
   JWT_SECRET = your_secret_here
   FRONTEND_URL = https://your-frontend.railway.app
   ```
5. Railway auto-detects Node.js and runs `npm start`

### Step 3 — Deploy Frontend on Railway
1. In the same project, click **New Service → GitHub Repo**
2. Set root directory to `/frontend`
3. Add variable:
   ```
   VITE_API_URL = https://your-backend.up.railway.app/api
   ```
4. Set build command: `npm run build`
5. Set start command: `npx serve dist -p $PORT`

> **Note:** Install `serve` in frontend: `npm install serve`

### Step 4 — Update CORS
In backend `.env` on Railway, set:
```
FRONTEND_URL=https://your-frontend.up.railway.app
```

---

## 🎯 Role Permissions Summary

| Action | Admin | Member |
|--------|-------|--------|
| View own tasks | ✅ | ✅ |
| Update task status | ✅ | ✅ (own tasks only) |
| View all tasks | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Create/delete projects | ✅ | ❌ |
| View assigned projects | ✅ | ✅ |
| Manage team members | ✅ | ❌ |

---

## 📹 Demo Video Checklist (2–5 min)
- [ ] Register as Admin, Register as Member
- [ ] Admin: Create a project, add members
- [ ] Admin: Create tasks, assign to member, set due dates
- [ ] Member: Login, view dashboard, update task status
- [ ] Admin: View Kanban board, Team page
- [ ] Show overdue task detection
- [ ] Show live URL

---

*Built with ❤️ using Node.js + React + MongoDB*
