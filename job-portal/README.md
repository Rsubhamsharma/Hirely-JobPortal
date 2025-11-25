# Job Portal

This is a full-stack job portal application built with the MERN stack.

## Prerequisites

- Node.js (v14 or later)
- MongoDB

## Backend Setup

1.  Navigate to the `Backend` directory:
    ```bash
    cd Amdox-Project-1/Backend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `Backend` directory by copying the `.env.sample` file:
    ```bash
    cp .env.sample .env
    ```
4.  Update the `.env` file with your MongoDB connection string and a JWT secret.
5.  Start the backend server:
    ```bash
    npm run dev
    ```
    The server will be running on `http://localhost:8000`.

## Frontend Setup

1.  Navigate to the `job-portal` directory:
    ```bash
    cd Amdox-Project-1/job-portal
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend application:
    ```bash
    npm start
    ```
    The application will be running on `http://localhost:3000`.

## How to Use

-   Open your browser and go to `http://localhost:3000`.
-   You can register as a "recruiter" or an "applicant".
-   Recruiters can post jobs and view applications for their jobs.
-   Applicants can view jobs and apply for them.
-   Both recruiters and applicants have their own dashboards to manage their activities.
