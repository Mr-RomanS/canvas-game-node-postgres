# 2D Canvas Game (Fullstack Portfolio Project)

## Overview

This project is a fullstack browser-based 2D game built using the Canvas API on the frontend and Node.js with Express and PostgreSQL on the backend.

The project demonstrates frontend rendering, backend API architecture, authentication system, session handling, file uploads, and database integration.

---

## Tech Stack

### Frontend
- HTML
- CSS
- Vanilla JavaScript
- Canvas API

### Backend
- Node.js
- Express
- PostgreSQL
- bcrypt (password hashing)
- express-session (session management)
- multer (file uploads)
- dotenv (environment configuration)

---

## Features

- 2D canvas rendering
- Player movement mechanics
- REST API structure
- User registration
- User authentication
- Password hashing
- Session-based authentication
- File upload handling
- PostgreSQL database integration
- Multi-language support (English, German, Ukrainian).

---


## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Mr-RomanS/canvas-game-node-postgres.git
cd canvas-game-node-postgres/server
```

### 2. Install dependencies

```bash
npm install
```

npm will install all required dependencies defined in package.json.

---

## Environment Variables

Create a `.env` file inside the `/server` directory.

Example:

```
PORT=3000

DB_HOST=localhost
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=your_database_name

SESSION_PASSWORD=your_secret_key
```
---

## Database Setup

1. Install PostgreSQL locally.
2. Create a new database.
3. Update your `.env` file with correct database credentials.
4. Make sure PostgreSQL server is running before starting the project.

---

## Running the Project

### Development mode

```bash
npm run dev
```

(Requires nodemon installed as a dev dependency)

### Production mode

```bash
npm start
```

The server will run at:

http://localhost:3000

---

## Roadmap

- [x] Basic frontend rendering
- [x] Backend API structure
- [x] PostgreSQL integration
- [ ] Collision detection system
- [ ] Leaderboard system
- [ ] Multiplayer support using WebSockets
- [ ] In-game chat
- [ ] Deployment to cloud hosting

---

## Future Improvements

- Real-time multiplayer functionality
- Score storage and ranking system
- Performance optimization
- Full cloud deployment
- Improved UI/UX design

---

## Status

The project is actively under development.
Core backend functionality and frontend rendering are implemented.
Game mechanics and multiplayer features are currently in progress.

---

## Author

Roman S.
