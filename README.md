# Meeting Room Booking — Setup Guide

## 1. Configure MySQL credentials

Edit `backend/.env` with your MySQL username and password:
```
DB_USER=root
DB_PASSWORD=your_actual_password
```

## 2. Create the database

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS meeting_room_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## 3. Seed the database (creates 4 sample users + bookings)

```bash
cd backend
npm run seed
```

This creates:
| Name    | Role  |
|---------|-------|
| Alice   | admin |
| Bob     | owner |
| Charlie | user  |
| Diana   | user  |

## 4. Start the backend

```bash
cd backend
npm run dev
# Runs on http://localhost:8000
# Swagger UI  → http://localhost:8000/api-docs
```

## 5. Start the frontend (new terminal)

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

## 6. Open the app

Navigate to http://localhost:3000 and select a user to log in.
