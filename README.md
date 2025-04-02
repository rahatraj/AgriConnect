# AgriConnect

A full-stack web application connecting farmers and storage facilities.

## Project Structure

```
AgriConnect/
├── frontend/          # React frontend application
├── backend/          # Node.js backend application
└── package.json      # Root package.json for managing both applications
```

## Features

- User Authentication
- Product Management
- Storage Facility Management
- Bidding System
- Payment Integration
- Real-time Updates
- Geolocation Services

## Tech Stack

### Frontend
- React
- Redux Toolkit
- Vite
- TailwindCSS
- Socket.IO Client

### Backend
- Node.js
- Express
- MongoDB
- Socket.IO
- JWT Authentication
- Cloudinary
- Razorpay Integration

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/agriconnect.git
cd agriconnect
```

2. Install dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables
- Copy `.env.sample` to `.env` in both frontend and backend directories
- Fill in the required environment variables

4. Start the development servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server (in a new terminal)
cd frontend
npm run dev
```

## Deployment

### Backend Deployment
1. Set up environment variables in your deployment platform
2. Deploy to your preferred platform (Render, Railway, etc.)
3. Get the backend URL

### Frontend Deployment
1. Update the `VITE_API_URL` in `.env.production`
2. Deploy to Vercel
3. Set up environment variables in Vercel dashboard

## Environment Variables

### Backend
- PORT
- NODE_ENV
- DB_URL
- JWT_SECRET_KEY
- And more (see backend/.env.sample)

### Frontend
- VITE_API_URL
- VITE_RAZORPAY_KEY

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the ISC License. 