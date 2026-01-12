# 🚀 GigFlow - Freelance Marketplace Platform

A full-stack mini-freelance marketplace where **Clients** can post jobs (Gigs) and **Freelancers** can submit competitive bids. Built with modern web technologies and featuring real-time notifications and transactional integrity.


## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Bonus Features](#-bonus-features)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)

## ✨ Features

### Core Functionality

- **User Authentication**: Secure JWT-based authentication with HttpOnly cookies
- **Fluid Roles**: Any user can post gigs (Client) or bid on gigs (Freelancer)
- **Gig Management**: Full CRUD operations for job postings
- **Smart Search**: Search gigs by title and description
- **Bidding System**: Freelancers can submit competitive bids with custom proposals
- **Hiring Workflow**: Clients review bids and hire freelancers instantly

### Advanced Features ⭐

- **Transactional Integrity** (Bonus 1): MongoDB transactions prevent race conditions during hiring
- **Real-time Notifications** (Bonus 2): Socket.IO powered instant notifications when hired
- **Responsive Design**: Beautiful Tailwind CSS UI works on all devices
- **State Management**: Redux Toolkit for predictable state updates

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Socket.IO** - WebSocket server
- **Cookie Parser** - Parse HTTP cookies

## 🏗 Architecture

### Database Schema

#### User
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

#### Gig
```javascript
{
  title: String (required),
  description: String (required),
  budget: Number (required),
  ownerId: ObjectId (ref: User),
  status: Enum ['open', 'assigned'],
  hiredBidId: ObjectId (ref: Bid),
  createdAt: Date,
  updatedAt: Date
}
```

#### Bid
```javascript
{
  gigId: ObjectId (ref: Gig),
  freelancerId: ObjectId (ref: User),
  message: String (required),
  price: Number (required),
  status: Enum ['pending', 'hired', 'rejected'],
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

#### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

#### Gigs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/gigs` | Get all open gigs (with search) | No |
| POST | `/api/gigs` | Create a new gig | Yes |
| GET | `/api/gigs/:id` | Get single gig | No |
| PUT | `/api/gigs/:id` | Update gig (owner only) | Yes |
| DELETE | `/api/gigs/:id` | Delete gig (owner only) | Yes |
| GET | `/api/gigs/my/posted` | Get user's posted gigs | Yes |

#### Bids
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bids` | Submit a bid | Yes |
| GET | `/api/bids/:gigId` | Get all bids for gig (owner only) | Yes |
| PATCH | `/api/bids/:bidId/hire` | Hire freelancer (atomic) | Yes |
| GET | `/api/bids/my/bids` | Get user's submitted bids | Yes |

## 📥 Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn**

### Clone Repository

```bash
git clone <your-repo-url>
cd gigflow-platform
```

### Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

## 🔧 Environment Setup

### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/gigflow


# JWT Secret
JWT_SECRET=G7w37Obi7QToDrVA4YYaYZd7WkKVqNAUBAU9TFCnIAj

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Running the Application

### Start MongoDB

Make sure MongoDB is running:

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### Start Backend Server

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend Development Server

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Access Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 🎯 Bonus Features

### Bonus 1: Transactional Integrity ✅

**Implementation**: MongoDB Sessions and Transactions

The hiring process uses atomic transactions to prevent race conditions:

```javascript
// When hiring a freelancer
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Update gig status to 'assigned'
  gig.status = 'assigned';
  await gig.save({ session });
  
  // 2. Update chosen bid to 'hired'
  bid.status = 'hired';
  await bid.save({ session });
  
  // 3. Reject all other bids atomically
  await Bid.updateMany(
    { gigId: gig._id, _id: { $ne: bid._id } },
    { status: 'rejected' },
    { session }
  );
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

**Result**: If two clients try to hire different freelancers simultaneously, only one succeeds. The transaction ensures data consistency.

### Bonus 2: Real-time Notifications ✅

**Implementation**: Socket.IO WebSocket Communication

When a freelancer is hired:

1. Backend emits `hired` event with job details
2. Frontend socket listener displays instant notification
3. Redux state updates automatically
4. No page refresh required!

```javascript
// Backend
io.to(freelancerSocketId).emit('hired', {
  message: `🎉 You've been hired for "${gigTitle}"!`,
  gig: gigDetails,
});

// Frontend
socket.on('hired', (data) => {
  toast.success(data.message);
  dispatch(updateBidStatus({ bidId: data.bid.id, status: 'hired' }));
});
```

## 📁 Project Structure

```
gigflow-platform/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── gigController.js      # Gig CRUD
│   │   └── bidController.js      # Bid & hiring logic
│   ├── middleware/
│   │   └── auth.js               # JWT authentication
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Gig.js                # Gig schema
│   │   └── Bid.js                # Bid schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── gigRoutes.js
│   │   └── bidRoutes.js
│   ├── utils/
│   │   └── generateToken.js      # JWT helper
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── config/
│   │   │   └── socket.js         # Socket.IO client
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateGig.jsx
│   │   │   ├── GigDetails.jsx
│   │   │   ├── MyGigs.jsx
│   │   │   └── MyBids.jsx
│   │   ├── store/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── gigSlice.js
│   │   │       └── bidSlice.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
└── README.md
```

## 🎨 Key Workflows

### 1. User Registration & Login
1. User registers with name, email, password
2. Password is hashed with bcrypt (10 rounds)
3. JWT token generated and set as HttpOnly cookie
4. User data stored in Redux and localStorage

### 2. Posting a Gig (Client Role)
1. Authenticated user fills gig form
2. Gig created with status "open"
3. Appears in public feed immediately
4. Owner can view, edit, or delete

### 3. Bidding on a Gig (Freelancer Role)
1. User browses open gigs
2. Submits bid with custom message and price
3. Bid stored with status "pending"
4. Only gig owner can see bids

### 4. Hiring a Freelancer (The Critical Flow)
1. Client views all bids on their gig
2. Clicks "Hire" button on chosen bid
3. **MongoDB Transaction starts**
4. Gig status → "assigned"
5. Chosen bid status → "hired"
6. All other bids → "rejected"
7. **Transaction commits**
8. Real-time notification sent to hired freelancer
9. Email/Dashboard updates for rejected bidders

## 🔒 Security Features

- **JWT Authentication**: HttpOnly cookies prevent XSS attacks
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configured allowed origins
- **Input Validation**: Server-side validation for all inputs
- **Authorization Checks**: Route-level and resource-level access control
- **MongoDB Injection Prevention**: Mongoose schema validation

## 📝 Testing the Hiring Flow

1. **Create two accounts**: Client (User A) and Freelancer (User B)
2. **User A** posts a gig
3. **User B** places a bid
4. **User A** views bids and clicks "Hire"
5. **Verify**:
   - Gig status changes to "assigned"
   - Bid status becomes "hired"
   - User B receives real-time notification
   - Other bids (if any) are marked "rejected"

## 🚀 Deployment Guide

### Backend (Render, Railway, Heroku)

1. Set environment variables in hosting platform
2. Ensure MongoDB connection string is correct
3. Deploy backend code
4. Note the deployed URL

### Frontend (Vercel, Netlify)

1. Update `VITE_API_URL` to backend URL
2. Build production bundle: `npm run build`
3. Deploy `dist` folder
4. Configure CORS on backend to allow frontend domain

## 📧 Submission Details

### GitHub Repository
- Clean, well-structured code
- Comprehensive README.md
- .env.example files included
- No secrets committed

### Hosted Links
- **Frontend**: [Your Vercel/Netlify URL]
- **Backend**: [Your Render/Railway URL]

### Demo Video
- 2-minute Loom/screen recording
- Walkthrough of hiring workflow
- Show real-time notifications
- Demonstrate transaction safety

## 👨‍💻 Author

**Your Name**
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

## 📄 License

This project is created for the ServiceHive Full Stack Development Internship Assignment.

---

**Built with ❤️ for ServiceHive**

For any questions or clarifications, reach out to:
- ritik.yadav@servicehive.tech
- hiring@servicehive.tech
