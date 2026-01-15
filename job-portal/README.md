# Job Portal - Full Stack Application

A modern, full-featured job portal application built with the MERN stack, featuring role-based access for recruiters and applicants, real-time messaging, competitions, and a professional UI/UX design.

## 🚀 Features

### For Applicants
- **Job Search & Discovery**: Browse and search jobs with advanced filters (location, job type, salary)
- **Application Management**: Track application status (pending, shortlisted, rejected, hired)
- **Profile Management**: Update profile, upload resume, manage personal information
- **Competitions**: Participate in coding challenges and competitions
- **Real-time Messaging**: Chat with recruiters and other users
- **Dark Mode**: Toggle between light and dark themes

### For Recruiters
- **Job Posting**: Create, edit, and manage job listings
- **Applicant Management**: View applications, shortlist candidates, update application status
- **Analytics Dashboard**: Track job performance and application metrics
- **Competition Hosting**: Create and manage coding competitions
- **Messaging**: Communicate with applicants in real-time

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image/file storage
- **Multer** - File upload handling

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the Backend folder:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Backend folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the job-portal folder:
```bash
cd job-portal
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the job-portal folder:
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🎨 UI/UX Design

The application features a modern, professional design with:
- Clean, minimal layouts inspired by Wellfound, LinkedIn, and Indeed
- Responsive design for all screen sizes
- Light and dark mode support
- Professional color palette with blue accents
- Smooth animations and transitions
- Accessible and user-friendly interface

## 📱 Key Pages

- **Home** - Landing page with hero section and features
- **Jobs** - Job listings with advanced search and filters
- **Competitions** - Browse and participate in coding challenges
- **Messages** - Real-time chat interface
- **Profile** - User profile management
- **Dashboard** - Analytics and statistics (recruiter only)
- **Applications** - Application tracking (applicant only)

## 🔐 Authentication

- JWT-based authentication
- Role-based access control (Applicant/Recruiter)
- Protected routes
- Secure password hashing with bcrypt

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the production bundle:
```bash
cd job-portal
npm run build
```

2. Deploy the `build` folder to your hosting platform

### Backend Deployment (Render/Railway/Heroku)

1. Ensure all environment variables are set
2. Deploy the Backend folder to your hosting platform
3. Update the frontend API URL to point to your deployed backend

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ for modern job seekers and recruiters

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Note**: Make sure to update the environment variables with your actual credentials before running the application.
