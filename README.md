# Birdchime Backend API

A modern, slot-based appointment booking system built with Node.js, Express, TypeScript, and MongoDB. Perfect for consultants, professionals, and businesses who need a reliable calendar management solution.

---

## 🚀 How to Run Locally

Get the application running on your local machine in 4 simple steps:

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (running locally or connection string)
- **Resend Account** (free at [resend.com](https://resend.com))

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start MongoDB

Ensure MongoDB is running:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 3: Configure Environment

Create a `.env` file in the project root:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/birdchime
JWT_SECRET=your-super-secret-jwt-key
RESEND_API_KEY=your-resend-api-key

# Optional (defaults provided)
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Get Resend API Key:** Sign up at [resend.com](https://resend.com) → API Keys → Create new key

### Step 4: Start the Application

```bash
npm run dev
```

**You should see:**

```
✓ Database connected successfully
✓ Cron jobs initialized
✓ Server is running on port 3001
```

**Server is ready at:** `http://localhost:3001` 🎉

**Test it:**

```bash
curl http://localhost:3001/health
# Response: {"status":"ok"}
```

---

## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Models](#-database-models)
- [Automated Jobs](#-automated-jobs)
- [Key Concepts](#-key-concepts)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Security](#-security)

---

## ✨ Features

### Core Functionality

- 🔐 **JWT Authentication** - Secure user authentication with HTTP-only cookies
- 📅 **Slot-Based Booking** - Pre-generated time slots for efficient appointment management
- 🌍 **Timezone Support** - Each user can set their own timezone for personalized working hours
- 🔄 **Automated Slot Management** - Cron jobs for weekly slot generation and daily cleanup
- 🌐 **Public Calendar Sharing** - Share your calendar via unique shareable links (UUID-based)
- 👥 **Multi-Guest Support** - Add multiple guests to appointments with automatic email notifications
- ✏️ **Appointment Management** - Create, edit, reschedule, and delete appointments
- 📧 **Email Notifications** - Automated emails for booking confirmations, cancellations, and reschedules

### Technical Excellence

- ⚡ **TypeScript** - Full type safety throughout the codebase
- 🏗️ **Clean Architecture** - Separation of concerns with controllers, services, and models
- ✅ **Input Validation** - Zod schemas for robust request validation
- 🔍 **Soft Deletes** - Appointments are soft-deleted for data integrity and audit trails
- 📊 **Pagination Support** - Efficient data retrieval with pagination for appointments
- 🔒 **Security First** - Password hashing, HTTP-only cookies, CORS configuration
- 📝 **Comprehensive Logging** - Detailed logging for debugging and monitoring

---

## 🛠️ Tech Stack

| Category           | Technology                    |
| ------------------ | ----------------------------- |
| **Runtime**        | Node.js                       |
| **Framework**      | Express.js 5.x                |
| **Language**       | TypeScript 5.x                |
| **Database**       | MongoDB with Mongoose 8.x     |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **Validation**     | Zod 4.x                       |
| **Email Service**  | Resend                        |
| **Scheduling**     | node-cron                     |
| **Date Handling**  | date-fns                      |
| **Security**       | cookie-parser, cors           |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v14 or higher (v18+ recommended)
- **MongoDB** v4.4 or higher (v6+ recommended)
- **npm** or **yarn** package manager
- **Resend Account** - Free tier available at [resend.com](https://resend.com)

---

## 📦 Installation

### Step-by-Step Setup

1. **Clone the repository:**

```bash
git clone <repository-url>
cd be
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the root directory (see [Quick Start](#-quick-start-for-developers) for required variables).

4. **Ensure MongoDB is running:**

**macOS (with Homebrew):**

```bash
brew services start mongodb-community
```

**Linux:**

```bash
sudo systemctl start mongod
```

**Windows:**

```bash
net start MongoDB
```

**Docker:**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. **Build the project (optional for production):**

```bash
npm run build
```

---

## 📁 Project Structure

```
be/
├── src/                           # Source files (TypeScript)
│   ├── config/                    # Configuration files
│   │   ├── database.ts           # MongoDB connection setup
│   │   └── env.ts                # Environment variable validation
│   ├── constants/                 # Application constants
│   │   └── slots.constants.ts    # Slot-related constants
│   ├── controllers/              # Request handlers (business logic)
│   │   ├── authController.ts     # Authentication endpoints
│   │   ├── appointmentsController.ts # Appointment management
│   │   └── usersController.ts    # User profile management
│   ├── enums/                    # TypeScript enums
│   │   └── appointment.enums.ts  # Appointment status enums
│   ├── jobs/                     # Cron jobs
│   │   └── slotCron.ts          # Automated slot generation/cleanup
│   ├── middleware/               # Express middleware
│   │   └── auth.ts              # JWT authentication middleware
│   ├── models/                   # Mongoose schemas
│   │   ├── User.ts              # User model
│   │   ├── Appointment.ts       # Appointment model
│   │   └── Slot.ts              # Slot model
│   ├── routes/                   # API routes
│   │   ├── auth.ts              # Authentication routes
│   │   ├── appointments.ts      # Appointment routes
│   │   └── users.ts             # User routes
│   ├── services/                 # Business logic services
│   │   ├── slotService.ts       # Slot generation and management
│   │   └── emailService.ts      # Email notification service
│   ├── utils/                    # Utility functions
│   │   ├── validation.ts        # Zod validation schemas
│   │   ├── slots.ts             # Slot generation helpers
│   │   ├── timezone.ts          # Timezone conversion utilities
│   │   ├── date.utils.ts        # Date manipulation helpers
│   │   ├── pagination.utils.ts  # Pagination helpers
│   │   ├── logger.utils.ts      # Logging utilities
│   │   ├── error.utils.ts       # Error handling utilities
│   │   ├── objectId.utils.ts    # MongoDB ObjectId helpers
│   │   ├── query.utils.ts       # Query building helpers
│   │   └── response.utils.ts    # Response formatting
│   └── server.ts                 # Application entry point
├── dist/                         # Compiled JavaScript (generated)
├── scripts/                      # Utility scripts
├── API_DOCUMENTATION.md          # Comprehensive API docs
      # Performance optimization details
├── UTILITY_FUNCTIONS_GUIDE.md    # Utility functions documentation
├── Db_desing.md                 # Database design documentation
├── postman_collection.json      # Postman collection for testing
├── package.json                  # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

---

## 📖 API Documentation

**Complete API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

### Quick API Overview

#### Authentication Endpoints

| Method | Endpoint           | Auth Required | Description                 |
| ------ | ------------------ | ------------- | --------------------------- |
| POST   | `/api/auth/signup` | No            | Create a new user account   |
| POST   | `/api/auth/login`  | No            | Login and receive JWT token |
| POST   | `/api/auth/logout` | No            | Logout and clear token      |
| GET    | `/api/auth/me`     | Yes           | Get current user info       |

#### Appointment Endpoints

| Method | Endpoint                                                       | Auth Required | Description                         |
| ------ | -------------------------------------------------------------- | ------------- | ----------------------------------- |
| GET    | `/api/appointments?sharableId=<id>&type=<past\|future>`        | No            | Get user's appointments (paginated) |
| GET    | `/api/appointments/available?sharableId=<id>&weekOffset=<num>` | No            | Get available slots grouped by day  |
| POST   | `/api/appointments`                                            | No            | Book an appointment                 |
| PATCH  | `/api/appointments/:id`                                        | Yes           | Edit/reschedule appointment         |
| DELETE | `/api/appointments/:id`                                        | Yes           | Cancel appointment (soft delete)    |

#### User Profile Endpoints

| Method | Endpoint                               | Auth Required | Description                 |
| ------ | -------------------------------------- | ------------- | --------------------------- |
| GET    | `/api/users/me`                        | Yes           | Get user profile            |
| POST   | `/api/users/me/regenerate-sharable-id` | Yes           | Generate new shareable link |

#### Health Check

| Method | Endpoint  | Auth Required | Description         |
| ------ | --------- | ------------- | ------------------- |
| GET    | `/health` | No            | Check server status |

### Key API Features

- **Timezone Handling**: All times stored in UTC, converted based on user's timezone
- **Pagination**: List endpoints support `page` and `limit` query parameters
- **sharableId-based Access**: Users share UUID-based links for public calendar access
- **Email Notifications**: Automatic emails for bookings, cancellations, and reschedules
- **Validation**: Comprehensive input validation with Zod schemas
- **Error Responses**: Consistent error format with descriptive messages

---

## 🗄️ Database Models

### User Model

```typescript
{
  email: string; // Unique email address
  password: string; // Bcrypt hashed password
  name: string; // Full name (min 2 characters)
  userId: string; // Unique user identifier
  sharableId: string; // UUID for calendar sharing
  timezone: string; // UTC offset (e.g., "+05:30", "-08:00")
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}
```

**Indexes:**

- `email` (unique)
- `userId` (unique)
- `sharableId` (unique)

### Slot Model

```typescript
{
  startTime: Date; // Slot start time (UTC)
  endTime: Date; // Slot end time (UTC)
  date: Date; // Date of the slot (UTC, 00:00:00)
  isBooked: boolean; // Booking status
  userId: ObjectId; // Reference to User
  dayId: number; // Day of week (0=Sunday, 6=Saturday)
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}
```

**Indexes:**

- `userId` + `date` + `startTime` (compound, for efficient queries)
- `userId` + `isBooked`
- `userId` + `date` + `isBooked`

### Appointment Model

```typescript
{
  userId: ObjectId;      // Reference to User (calendar owner)
  slotId: ObjectId;      // Reference to Slot
  name: string;          // Guest name
  email: string;         // Guest email
  phone?: string;        // Optional phone number
  guests: string[];      // Additional guest emails
  reason?: string;       // Purpose/notes (max 500 chars)
  status: "pending" | "done";
  isDeleted: boolean;    // Soft delete flag
  createdAt: Date;       // Auto-generated
  updatedAt: Date;       // Auto-generated
}
```

**Indexes:**

- `userId`
- `slotId`
- `userId` + `isDeleted` + `status`

---

## ⏰ Automated Jobs

The system runs automated background jobs using `node-cron`:

### 1. Weekly Slot Generation

**Schedule:** Every Sunday at 00:00 (midnight)

**Purpose:** Generates slots for the next week for all users

**Details:**

- Runs for each user based on their timezone
- Creates slots for Monday-Friday only
- Working hours: 9 AM - 5 PM in user's local time
- Slot duration: 30 minutes
- Skips holidays and weekends

**Cron Expression:** `0 0 * * 0` (Every Sunday at midnight)

### 2. Daily Slot Cleanup

**Schedule:** Every day at 02:00 AM

**Purpose:** Removes past unbooked slots to optimize database performance

**Details:**

- Deletes slots where `endTime < now` and `isBooked = false`
- Keeps booked slots for historical records
- Helps maintain database efficiency

**Cron Expression:** `0 2 * * *` (Every day at 2 AM)

---

## 💡 Key Concepts

### Slot-Based System

The system uses pre-generated time slots instead of allowing arbitrary bookings. This approach provides:

✅ **No Double-Bookings** - Slots are marked as booked atomically  
✅ **Better Performance** - Pre-indexed slot queries are fast  
✅ **Explicit Availability** - Clear view of open/booked times  
✅ **Simplified Validation** - No need to check for time conflicts

### User Timezone Management

Each user sets their timezone during signup (e.g., `"+05:30"` for India, `"-08:00"` for US Pacific):

- **Fixed Working Hours**: 9 AM - 5 PM in user's local time
- **UTC Storage**: All times stored in UTC in the database
- **Automatic Conversion**: Backend converts user's local hours to UTC for slot generation
- **Client Responsibility**: Frontend displays times in user's preferred timezone

**Example:**

- User in India (UTC+5:30): 9 AM IST = 3:30 AM UTC
- Slots generated: 3:30 AM - 11:30 AM UTC
- Displayed to client: 9:00 AM - 5:00 PM IST

### Soft Delete Pattern

Appointments are **soft-deleted** (marked with `isDeleted: true`) rather than permanently removed:

✅ **Data Integrity** - Historical records preserved  
✅ **Audit Trail** - Track all appointment history  
✅ **Slot Reusability** - Deleted appointments free up slots  
✅ **Undo Capability** - Potential to restore canceled appointments

### Public Access Model

The system uses a **sharableId-based access model**:

- **Public Operations** (no auth):

  - View appointments via sharableId
  - View available slots via sharableId
  - Book appointments via sharableId

- **Protected Operations** (auth required):
  - View own profile
  - Edit/reschedule appointments
  - Delete appointments
  - Regenerate sharableId

This model enables easy calendar sharing while protecting user data.

---

## 🔧 Development

### Available Scripts

| Command         | Description                                            |
| --------------- | ------------------------------------------------------ |
| `npm run dev`   | Start development server with hot-reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to JavaScript (outputs to `dist/`)  |
| `npm start`     | Run production server (uses compiled `dist/` files)    |

### Development Workflow

1. **Start MongoDB** (if not already running)
2. **Run development server**: `npm run dev`
3. **Make changes** - Files auto-reload on save
4. **Test endpoints** - Use Postman collection or curl
5. **Check logs** - Console shows detailed request/error logs

### Code Style Guidelines

- ✅ Use TypeScript strict mode
- ✅ Define proper types for all functions
- ✅ Use interfaces for complex objects
- ✅ Avoid `any` type unless absolutely necessary
- ✅ Follow existing project structure
- ✅ Write descriptive comments for complex logic
- ✅ Use Zod for runtime validation
- ✅ Handle errors gracefully with try-catch
- ✅ Use utility functions from `utils/` directory

### Adding New Features

1. **Models** - Define in `src/models/`
2. **Controllers** - Add logic in `src/controllers/`
3. **Routes** - Register in `src/routes/`
4. **Services** - Complex logic in `src/services/`
5. **Validation** - Add Zod schemas in `src/utils/validation.ts`
6. **Documentation** - Update `API_DOCUMENTATION.md`

---

## 🧪 Testing

### Manual Testing with Postman

Import the included `postman_collection.json` file into Postman.

**Testing Flow:**

1. **Signup** - Create a new user account
2. **Login** - Authenticate and get JWT token (stored in cookies)
3. **Get Profile** - Verify authentication works
4. **Get Available Slots** - View your calendar slots
5. **Book Appointment** - Create a test booking
6. **Get Appointments** - List all appointments
7. **Edit Appointment** - Reschedule a booking
8. **Delete Appointment** - Cancel a booking
9. **Regenerate sharableId** - Get a new sharing link

### Manual Testing with cURL

**1. Signup:**

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "timezone": "+05:30"
  }' \
  -c cookies.txt
```

**2. Get Available Slots:**

```bash
curl -X GET "http://localhost:3001/api/appointments/available?sharableId=YOUR_SHARABLE_ID&weekOffset=0"
```

**3. Book Appointment:**

```bash
curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "sharableId": "YOUR_SHARABLE_ID",
    "slotId": "SLOT_ID",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "reason": "Consultation"
  }'
```

**4. Get Appointments:**

```bash
curl -X GET "http://localhost:3001/api/appointments?sharableId=YOUR_SHARABLE_ID&type=future&page=1&limit=10"
```

---

## 🚀 Deployment

### Production Build

1. **Set production environment variables:**

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-production-secret-key
RESEND_API_KEY=your-production-resend-key
FRONTEND_URL=https://your-frontend-domain.com
PORT=3001
```

2. **Build the application:**

```bash
npm run build
```

3. **Start the server:**

```bash
npm start
```

### Deployment Platforms

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

#### Heroku

```bash
# Add Procfile
echo "web: npm start" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

#### DigitalOcean / AWS / GCP

- Use Node.js app platform
- Set environment variables in platform dashboard
- Connect to managed MongoDB (MongoDB Atlas recommended)

### Production Checklist

- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Use production MongoDB with authentication enabled
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Set appropriate CORS origins (not wildcard)
- [ ] Enable rate limiting middleware
- [ ] Set up proper logging and monitoring
- [ ] Configure MongoDB connection pooling
- [ ] Enable MongoDB backups
- [ ] Set up health check monitoring
- [ ] Configure email domain verification in Resend
- [ ] Review and test cron job schedules
- [ ] Enable process manager (PM2) for auto-restart

---

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Failed

**Error:**

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

- Verify MongoDB is running: `mongosh` or `mongo`
- Check MongoDB service status
- Verify `MONGODB_URI` in `.env`
- Ensure MongoDB port is not blocked by firewall

**Start MongoDB:**

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker
docker start mongodb
```

#### 2. Port Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solutions:**

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

#### 3. Environment Variables Not Found

**Error:**

```
❌ Environment variable validation failed:
MONGODB_URI: MONGODB_URI is required
```

**Solutions:**

- Create `.env` file in project root
- Verify all required variables are set
- Check for typos in variable names
- Ensure `.env` is not in `.gitignore` (or create from example)

#### 4. JWT Secret Error

**Error:**

```
Error: JWT_SECRET is required
```

**Solution:**

- Add `JWT_SECRET=your-secret-key` to `.env`
- Use a strong random string (e.g., `openssl rand -base64 32`)

#### 5. Email Sending Failures

**Error:**

```
Email sending failed: Invalid API key
```

**Solutions:**

- Verify `RESEND_API_KEY` in `.env`
- Check Resend account status and quota
- Verify domain verification in Resend dashboard
- Check Resend API logs for detailed errors

#### 6. Cron Jobs Not Running

**Issue:** Slots not generating automatically

**Solutions:**

- Check server logs for cron job execution
- Verify cron expressions in `src/jobs/slotCron.ts`
- Ensure server is running continuously
- Check for timezone-related issues

#### 7. TypeScript Compilation Errors

**Error:**

```
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**Solutions:**

- Run `npm run build` to see all errors
- Check TypeScript version compatibility
- Review type definitions in models/interfaces
- Clear `dist/` and rebuild: `rm -rf dist && npm run build`

---

## 🔒 Security

### Current Security Features

✅ **Password Security**

- Passwords hashed with bcryptjs (10 rounds)
- Never stored in plain text

✅ **Authentication**

- JWT tokens with expiration
- HTTP-only cookies (XSS protection)
- Secure cookie flags in production

✅ **Input Validation**

- Zod schemas for all endpoints
- Type-safe validation
- Sanitized error messages

✅ **CORS Protection**

- Configured allowed origins
- Credentials enabled for trusted domains
- Pre-flight request handling

✅ **Authorization**

- Ownership verification for protected resources
- JWT middleware on sensitive endpoints

✅ **Database Security**

- Mongoose schema validation
- Indexed fields for performance and integrity
- Connection pooling

### Production Security Recommendations

#### Essential (Must Have)

1. **Use HTTPS**

   - Get SSL certificate (Let's Encrypt recommended)
   - Configure reverse proxy (Nginx/Apache)

2. **Secure Environment Variables**

   - Never commit `.env` to version control
   - Use strong, random `JWT_SECRET` (32+ characters)
   - Rotate secrets regularly

3. **MongoDB Security**

   - Enable authentication
   - Use strong passwords
   - Whitelist IP addresses
   - Use MongoDB Atlas with VPC peering (production)

4. **Rate Limiting**

   ```bash
   npm install express-rate-limit
   ```

   ```typescript
   import rateLimit from "express-rate-limit";

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
   });

   app.use("/api/", limiter);
   ```

5. **Helmet for HTTP Headers**
   ```bash
   npm install helmet
   ```
   ```typescript
   import helmet from "helmet";
   app.use(helmet());
   ```

#### Recommended (Should Have)

1. **API Versioning**

   - Use `/api/v1/` prefixes
   - Maintain backward compatibility

2. **Request Logging**

   - Use Morgan or Winston
   - Log suspicious activity
   - Don't log sensitive data

3. **Error Handling**

   - Don't expose stack traces in production
   - Use generic error messages for users
   - Log detailed errors server-side

4. **Data Encryption**

   - Encrypt sensitive data at rest
   - Use TLS for data in transit

5. **Security Headers**
   ```typescript
   app.use((req, res, next) => {
     res.setHeader("X-Content-Type-Options", "nosniff");
     res.setHeader("X-Frame-Options", "DENY");
     res.setHeader("X-XSS-Protection", "1; mode=block");
     next();
   });
   ```

#### Advanced (Nice to Have)

1. **Monitoring & Alerts**

   - Use Sentry or Datadog
   - Set up uptime monitoring
   - Alert on suspicious patterns

2. **Backup Strategy**

   - Automated daily MongoDB backups
   - Test restore procedures
   - Store backups securely off-site

3. **Penetration Testing**

   - Regular security audits
   - Dependency vulnerability scans
   - OWASP Top 10 compliance

4. **DDoS Protection**
   - Use Cloudflare or AWS Shield
   - Configure load balancers

---

## 📚 Additional Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[Db_desing.md](./Db_desing.md)** - Database schema and design decisions

---

<div align="center">

**Built with ❤️ using Node.js, Express, TypeScript, and MongoDB**

⭐ Star this repo if you find it useful!

[Report Bug](https://github.com/yourusername/birdchime/issues) · [Request Feature](https://github.com/yourusername/birdchime/issues)

</div>
