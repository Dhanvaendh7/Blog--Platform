# 📚 Full-Stack Blog Platform Tutorial
## Complete, Free, Step-by-Step Guide

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Prerequisites](#3-prerequisites)
4. [Project Structure](#4-project-structure)
5. [Backend Setup](#5-backend-setup)
6. [Frontend Setup](#6-frontend-setup)
7. [Running the Application](#7-running-the-application)
8. [API Documentation](#8-api-documentation)
9. [Feature Walkthrough](#9-feature-walkthrough)
10. [Next Steps](#10-next-steps)

---

## 1. Project Overview

This tutorial guides you through building a complete **Blog Platform with Comments** — a full-stack application where users can:

- ✅ Register and login with secure authentication
- ✅ Create, read, edit, and delete blog posts
- ✅ Comment on posts
- ✅ View all posts with author information
- ✅ Edit/delete only their own content

**Architecture:**
```
┌─────────────────┐      REST API      ┌─────────────────┐
│   Frontend      │ ◄────────────────► │    Backend      │
│  (HTML/CSS/JS)  │   JSON over HTTP   │  (Node.js API)  │
└─────────────────┘                    └─────────────────┘
                                              │
                                              ▼
                                        ┌─────────────────┐
                                        │   SQLite DB     │
                                        │  (blog.db file) │
                                        └─────────────────┘
```

---

## 2. Tech Stack

### Backend (100% Free)
| Technology | Purpose | Cost |
|-----------|---------|------|
| **Node.js** | JavaScript runtime | Free |
| **Express.js** | Web framework | Free |
| **SQLite3** | Database (file-based) | Free |
| **bcryptjs** | Password hashing | Free |
| **jsonwebtoken** | JWT authentication | Free |
| **CORS** | Cross-origin requests | Free |

### Frontend (100% Free)
| Technology | Purpose | Cost |
|-----------|---------|------|
| **Vanilla HTML** | Page structure | Free |
| **CSS3** | Styling & responsive design | Free |
| **Vanilla JavaScript** | Logic & API calls | Free |
| **Google Fonts (Inter)** | Typography | Free |

---

## 3. Prerequisites

Before starting, you need:

1. **Node.js** (v16 or higher) — [Download free](https://nodejs.org/)
2. **A code editor** — VS Code (free) recommended
3. **A terminal** — Command Prompt, Terminal, or VS Code integrated terminal

**Verify installation:**
```bash
node --version    # Should show v16.x.x or higher
npm --version     # Should show 8.x.x or higher
```

---

## 4. Project Structure

```
blog-platform/
├── backend/
│   ├── server.js              # Main server entry point
│   ├── db.js                  # Database configuration
│   ├── package.json           # Backend dependencies
│   ├── .env.example           # Environment variables template
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   └── routes/
│       ├── auth.js            # Login/Register endpoints
│       ├── posts.js           # CRUD for blog posts
│       └── comments.js        # Comment endpoints
│
├── frontend/
│   ├── index.html             # Main HTML file
│   ├── styles.css             # All styling
│   ├── app.js                 # Frontend JavaScript
│   └── package.json           # Frontend metadata
│
└── README.md                  # This tutorial
```

---

## 5. Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd blog-platform/backend
```

### Step 2: Create Environment File
```bash
# Copy the example file
cp .env.example .env

# Edit .env and set a secure secret:
# PORT=5000
# JWT_SECRET=your-super-secret-key-change-this
```

### Step 3: Install Dependencies
```bash
npm install
```

This installs:
- `express` — Web server framework
- `sqlite3` — Database (no separate server needed!)
- `bcryptjs` — Hash passwords securely
- `jsonwebtoken` — Create/verify JWT tokens
- `cors` — Allow frontend to call the API
- `dotenv` — Load environment variables

### Step 4: Start the Server
```bash
# Development mode (auto-restarts on file changes)
npm run dev

# OR production mode
npm start
```

You should see:
```
🚀 Server running on http://localhost:5000
```

### Step 5: Test the API
Open your browser or use curl:
```bash
curl http://localhost:5000/api/health
# Response: {"status":"OK","message":"Blog Platform API is running"}
```

---

## 6. Frontend Setup

### Step 1: Navigate to Frontend Directory
Open a **new terminal window** and run:
```bash
cd blog-platform/frontend
```

### Step 2: Install a Simple HTTP Server
```bash
npm install -g serve
```

> **Note:** `serve` is a lightweight static file server. You can also use Python's built-in server: `python -m http.server 3000`

### Step 3: Start the Frontend
```bash
npm start
# OR
npx serve . -l 3000
```

Open your browser to: **http://localhost:3000**

---

## 7. Running the Application

### Full Development Workflow

**Terminal 1 — Backend:**
```bash
cd blog-platform/backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd blog-platform/frontend
npx serve . -l 3000
```

**Browser:**
- Frontend: http://localhost:3000
- API Base: http://localhost:5000

---

## 8. API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Login & get token | No |

**Register Example:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"securepass123"}'
```

**Login Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"securepass123"}'
```

### Posts Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts` | List all posts | No |
| GET | `/api/posts/:id` | Get single post + comments | No |
| POST | `/api/posts` | Create new post | Yes (JWT) |
| PUT | `/api/posts/:id` | Update own post | Yes (Owner) |
| DELETE | `/api/posts/:id` | Delete own post | Yes (Owner) |

### Comments Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/comments` | Add comment to post | Yes (JWT) |
| DELETE | `/api/comments/:id` | Delete own comment | Yes (Owner) |

### Request Headers for Protected Routes
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## 9. Feature Walkthrough

### 🔐 Authentication Flow
1. User fills registration form → POST to `/api/auth/register`
2. Password is hashed with bcrypt before storage
3. User logs in → POST to `/api/auth/login`
4. Server returns JWT token
5. Token stored in `localStorage`
6. Token sent in `Authorization` header for protected routes

### 📝 Post Management
1. **Create:** Authenticated users fill form → POST `/api/posts`
2. **Read:** Anyone can view all posts or single post
3. **Update:** Only the post author can edit (checked via JWT user ID)
4. **Delete:** Only the post author can delete

### 💬 Comment System
1. View post → see all comments
2. Logged-in users can add comments
3. Comment authors can delete their own comments
4. Comments show author name and timestamp

### 🎨 Frontend Features
- **Responsive grid** layout for posts
- **Single Page Application** feel (no page reloads)
- **Toast notifications** for user feedback
- **Protected routes** (can't create post without login)
- **Real-time UI updates** after actions

---

## 10. Next Steps & Enhancements

Once you have this working, consider adding:

### Free Enhancements
| Feature | How to Implement |
|---------|-----------------|
| **Like/Upvote system** | Add `likes` table with post_id + user_id |
| **Post categories/tags** | Add `category` column to posts table |
| **Search posts** | Add SQL `LIKE` query on title/content |
| **User profiles** | Add bio, avatar URL to users table |
| **Pagination** | Add `LIMIT`/`OFFSET` to post queries |
| **Markdown support** | Use `marked.js` library on frontend |
| **Dark mode** | CSS variables + toggle in localStorage |

### Deployment (Free Options)
| Platform | Backend | Frontend |
|----------|---------|----------|
| **Render** | Free tier Node.js hosting | Free static site |
| **Railway** | Free tier with SQLite | — |
| **Vercel** | — | Free static hosting |
| **GitHub Pages** | — | Free static hosting |

---

## 🎯 Quick Start Checklist

- [ ] Install Node.js (v16+)
- [ ] Download this project folder
- [ ] `cd backend && npm install`
- [ ] `cp .env.example .env` and set JWT_SECRET
- [ ] `npm run dev` (starts backend on :5000)
- [ ] Open new terminal
- [ ] `cd frontend && npx serve . -l 3000`
- [ ] Open http://localhost:3000 in browser
- [ ] Register a test account
- [ ] Create your first post!

---

## 🆘 Troubleshooting

**"Cannot find module" errors?**
→ Run `npm install` in the correct directory

**"Port already in use"?**
→ Change PORT in `.env` or kill the process: `npx kill-port 5000`

**CORS errors in browser?**
→ Ensure backend is running and CORS middleware is enabled

**Database locked?**
→ SQLite is file-based; only one process can write. Stop other Node processes.

---

**Happy coding! 🚀**

*This entire project uses 100% free, open-source technologies. No paid services required.*
