# AGENTS.md - Hirely Job Portal

This document provides guidelines for agentic coding agents working in this repository.

## Project Overview

**Hirely** is a full-stack job portal application with:
- **Backend**: Node.js/Express API with MongoDB/Mongoose (ES Modules)
- **Frontend**: React 19 with Tailwind CSS, React Router, and React Query

---

## Build/Lint/Test Commands

### Backend (Backend/)

```bash
# Navigate to Backend directory
cd Backend

# Install dependencies
npm install

# Start development server (with hot reload via nodemon)
npm run dev

# Start production server
npm start

# Run tests (not configured - `echo "Error: no test specified"`)
npm test
```

### Frontend (job-portal/)

```bash
# Navigate to job-portal directory
cd job-portal

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run a single test file (CRA)
npm test -- --testPathPattern="filename.test.js"

# Watch mode for tests
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Eject (one-way operation)
npm run eject
```

### Running a Single Test (Frontend)

```bash
# Method 1: Interactive mode
npm test

# Then press 'p' to filter by filename pattern

# Method 2: Non-interactive with pattern
npm test -- --testPathPattern="Jobs.test.js" --watchAll=false
```

---

## Project Structure

```
Hirely/
├── Backend/                    # Express.js API
│   ├── src/
│   │   ├── controllers/        # Route handlers (asyncHandler wrapper)
│   │   ├── DB/                # Database connection
│   │   ├── middlewares/       # Auth, validation, rate limiting, error handling
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # Express route definitions
│   │   ├── services/         # Business logic, external APIs, AI services
│   │   ├── socket/            # Socket.io configuration
│   │   ├── templates/        # Email templates
│   │   ├── utils/            # Helpers (ApiError, ApiResponse, asyncHandler)
│   │   ├── app.js            # Express app setup
│   │   ├── constants.js      # Application constants
│   │   └── index.js          # Server entry point
│   └── package.json
│
└── job-portal/                # React frontend
    ├── src/
    │   ├── api/              # Axios instance configuration
    │   ├── components/       # Reusable React components
    │   │   └── skeletons/    # Loading skeleton components
    │   ├── config/           # App configuration
    │   ├── context/          # React Context (Auth, Socket, Theme)
    │   ├── hooks/            # Custom React hooks
    │   ├── lib/              # Library setup (queryClient)
    │   ├── pages/            # Page components
    │   │   └── userEmployee/ # Authenticated user pages
    │   ├── App.js            # Main app with routing
    │   └── index.js          # Entry point
    ├── public/               # Static assets
    └── package.json
```

---

## Code Style Guidelines

### General Principles

1. **ES Modules**: Backend uses ES modules (`import`/`export`), not CommonJS
2. **Async/Await**: Always use async/await with `asyncHandler` wrapper for routes
3. **Error Handling**: Use `ApiError` class for consistent error responses
4. **Consistent Responses**: Use `ApiResponse` class for success responses

### Backend Conventions

#### File Naming
- Schemas: `*.schema.js` (e.g., `user.schema.js`)
- Controllers: `*.controllers.js` (e.g., `job.controllers.js`)
- Routes: `*.routes.js` (e.g., `job.routes.js`)
- Middlewares: `*.middleware.js` (e.g., `auth.middleware.js`)
- Utils: `*.util.js` (e.g., `jobNormalizer.util.js`)

#### Imports
```javascript
// Use .js extension for local imports (required for ES modules)
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Job from "../models/job.schema.js";

// Use named exports for utilities
export const someFunction = () => {};
// Default export for models and schemas
export default Job;
```

#### Async Handler Pattern
```javascript
const myController = asyncHandler(async (req, res) => {
    // No try-catch needed - asyncHandler handles errors
    const result = await someAsyncOperation();
    res.status(200).json(new ApiResponse(200, result, "Success message"));
});
```

#### Error Handling
```javascript
// Throw ApiError with status code and message
throw new ApiError(400, "Validation failed");
throw new ApiError(401, "Unauthorized access");
throw new ApiError(404, "Resource not found");
throw new ApiError(500, "Internal server error");
```

#### API Response Format
```javascript
// Success response
res.status(200).json(new ApiResponse(200, data, "Success message"));

// ApiError class structure
class ApiError extends Error {
    constructor(
        statusCode = 500,
        message = "Something went wrong",
        data = null,
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = false;
        this.errors = errors;
    }
}
```

#### Mongoose Schema Conventions
```javascript
const userSchema = new mongoose.Schema(
  {
    fieldName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["applicant", "recruiter", "admin"],
    },
  },
  { timestamps: true }  // Auto-add createdAt/updatedAt
);
```

#### Route Definition Pattern
```javascript
import express from "express";
import { someController } from "../controllers/some.controllers.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes first
router.route("/public-endpoint").get(someController);

// Protected routes with middleware
router.route("/protected-endpoint").get(verifyjwt, someController);

export default router;
```

### Frontend Conventions

#### File Naming
- Components: PascalCase (e.g., `Navbar.js`, `JobCard.js`)
- Pages: PascalCase (e.g., `Jobs.js`, `Login.js`)
- Hooks: camelCase with `use` prefix (e.g., `useSocketEvents.js`)
- Utils/Config: camelCase (e.g., `queryClient.js`, `axios.js`)
- Context: PascalCase with `Context` suffix (e.g., `AuthContext.js`)

#### Component Structure
```javascript
import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SomeIcon } from "lucide-react";

function MyComponent() {
    const [state, setState] = useState(initialValue);

    useEffect(() => {
        // Effect logic
        return () => {};  // Cleanup if needed
    }, [dependencies]);

    // Handler functions
    const handleClick = () => {
        // Logic
    };

    return (
        <div className="container">
            <h1>Title</h1>
            <button onClick={handleClick}>Click</button>
        </div>
    );
}

export default MyComponent;
```

#### CSS/Tailwind Guidelines
- Use Tailwind CSS utility classes (see `tailwind.config.js`)
- Primary color: `indigo-600`, Accent color: `green-500`
- Dark mode: Use `dark:` prefix for dark mode styles
- Use `slate-*` for neutral grays
- Text colors: `text-slate-900 dark:text-white` for headings
- Body text: `text-slate-600 dark:text-slate-400`

#### State Management Pattern
```javascript
// Local state for UI state
const [isOpen, setIsOpen] = useState(false);

// For data fetching, use React Query (from @tanstack/react-query)
// Custom hooks in src/hooks/ encapsulate API calls
```

#### API Calls Pattern
```javascript
import api from "../../api/axios";

// In a component or hook
try {
    const res = await api.get("/endpoint");
    if (res.data.success) {
        const data = res.data.data;
        // Handle data
    }
} catch (error) {
    console.error("Error message:", error);
    toast.error(error.response?.data?.message || "Something went wrong");
}
```

#### React Router Patterns
```javascript
import { useNavigate, useParams } from "react-router-dom";

// Navigation
const navigate = useNavigate();
navigate("/path");
navigate("/path", { state: { data } });  // With state

// URL params
const { id } = useParams();
```

#### Lazy Loading Pages
```javascript
// In App.js - use lazy loading for all page components
const Home = lazy(() => import("./pages/Home"));

// Wrap in Suspense
<Suspense fallback={<Loading />}>
    <Routes>
        <Route path="/" element={<Home />} />
    </Routes>
</Suspense>
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `userData`, `jobId` |
| Functions | camelCase | `createJob`, `handleSubmit` |
| React Components | PascalCase | `Navbar`, `JobCard` |
| React Hooks | camelCase with `use` | `useAuth`, `useSocket` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_URL` |
| Mongoose Models | PascalCase, singular | `User`, `Job`, `Profile` |
| Files | kebab-case or PascalCase | `job-controller.js` or `JobController.js` |
| CSS Classes | kebab-case (Tailwind) | `text-center`, `bg-blue-600` |
| Route paths | kebab-case | `/my-applications`, `/job-detail` |
| Environment vars | UPPER_SNAKE_CASE | `PORT`, `MONGO_URI` |

---

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb_connection_string
JWT_SECRET=your_secret
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## API Response Format

### Success Response
```json
{
    "statusCode": 200,
    "data": { ... },
    "message": "Success message",
    "success": true
}
```

### Error Response
```json
{
    "statusCode": 400,
    "message": "Error message",
    "success": false,
    "errors": []
}
```

---

## Common Patterns

### Role-Based Access
- `user.role === "applicant"` - Job seekers
- `user.role === "recruiter"` - Employers
- `user.role === "admin"` - Administrators

### Protected Route Pattern
```javascript
<ProtectedRoute>
    <SomeComponent />
</ProtectedRoute>
```

### Socket.io Events
- `unread_message` - New message received
- `messages_read` - Messages marked as read

---

## Development Workflow

1. **Backend changes**: Restart server with `npm run dev`
2. **Frontend changes**: Hot reload via webpack-dev-server
3. **Database**: Ensure MongoDB is running locally or use MongoDB Atlas
4. **Testing**: Manual testing via Postman/curl or frontend UI

---

## Dependencies Key Notes

### Backend
- Express 5.x with async handlers
- Mongoose 8.x for MongoDB
- Socket.io 4.x for real-time features
- JWT for authentication
- Joi for validation
- Multer for file uploads
- Cloudinary for image storage

### Frontend
- React 19
- React Router 7
- Tailwind CSS 3.x
- React Query 5.x
- Socket.io-client
- Lucide React icons
- React Hot Toast

---

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure frontend URL is in `allowedOrigins` in `Backend/src/app.js`
2. **JWT errors**: Check `ACCESS_TOKEN_SECRET` and token expiration
3. **MongoDB connection**: Verify `MONGO_URI` in backend `.env`
4. **Hot reload not working**: Restart the dev server
