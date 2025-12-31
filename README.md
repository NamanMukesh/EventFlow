# EventFlow - Event Booking System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for event booking and management with secure payment processing via Stripe.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Brevo Email Setup](#brevo-email-setup)
- [Stripe Payment Setup with ngrok](#stripe-payment-setup-with-ngrok)
- [Screenshots](#screenshots)
- [API Endpoints](#api-endpoints)
- [Version Details](#version-details)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### User Features
- 🔐 **Authentication**: Secure user registration and login with JWT
- 🎫 **Browse Events**: View all available events with filters (category, location)
- 📅 **Event Details**: View detailed information about events including dates and time slots
- 🎟️ **Book Tickets**: Select date, time slot, and number of seats
- 💳 **Secure Payments**: PCI-compliant payment processing via Stripe
- 📋 **My Bookings**: View and manage all your bookings
- ❌ **Cancel Bookings**: Cancel bookings with automatic seat refund
- 📧 **Email Notifications**: Receive email confirmations and event reminders

### Admin Features
- 👑 **Admin Panel**: Dedicated admin dashboard
- ➕ **Create Events**: Add new events with multiple dates and time slots
- ✏️ **Edit Events**: Update event details, dates, and availability
- 🗑️ **Delete Events**: Remove events from the system
- 📊 **Event Management**: Full CRUD operations for events

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.0 - UI library
- **React Router DOM** 7.11.0 - Client-side routing
- **Vite** 7.2.4 - Build tool and dev server
- **Tailwind CSS** 4.1.18 - Utility-first CSS framework
- **Axios** 1.13.2 - HTTP client
- **React Hot Toast** 2.6.0 - Toast notifications
- **Stripe.js** 8.6.0 - Payment processing
- **@stripe/react-stripe-js** 5.4.1 - React components for Stripe

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** 5.2.1 - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** 9.0.2 - MongoDB object modeling
- **JWT** 9.0.3 - Authentication tokens
- **bcryptjs** 3.0.3 - Password hashing
- **Stripe** 20.1.0 - Payment processing API
- **nodemailer** 7.0.12 - Email sending library
- **nodemailer-brevo-transport** - Brevo email transport
- **node-cron** 4.2.1 - Task scheduler for email reminders
- **CORS** 2.8.5 - Cross-origin resource sharing
- **Cookie Parser** 1.4.7 - Cookie parsing middleware

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (v6.0.0 or higher) - Local installation or MongoDB Atlas account
- **Git** - For version control
- **ngrok** - For Stripe webhook testing (optional but recommended)
- **Brevo Account** - For email notifications (free tier: 300 emails/day)

## 📁 Project Structure

```
EventFlow/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   │   └── admin/      # Admin-specific pages
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx         # Main App component
│   ├── package.json
│   └── README.md
├── server/                 # Express backend application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   └── routes/         # API routes
│   ├── server.js           # Entry point
│   ├── package.json
│   └── README.md
└── README.md              # This file
```

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone `https://github.com/NamanMukesh/EventFlow`
cd EventFlow
```

### 2. Backend Setup

```bash

cd server
npm install
npm run server
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash

cd client
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔐 Environment Variables

### Backend (`server/.env`)

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Brevo Email Configuration
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=your-verified-email@example.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (`client/.env`)

Create a `.env` file in the `client` directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000

# Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## ▶️ Running the Application

1. **Start Backend Server**
   ```bash
   cd server
   npm run server
   ```

2. **Start Frontend** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000


## 📧 Brevo Email Setup

EventFlow uses Brevo (formerly Sendinblue) for sending email notifications and reminders.

### Step 1: Create Brevo Account

1. Sign up for a free account at [Brevo](https://www.brevo.com/)
2. Verify your email address

### Step 2: Get Your API Key

1. Go to [Brevo Dashboard](https://app.brevo.com/)
2. Navigate to **Settings** → **SMTP & API** → **API Keys** tab
3. Click **"Generate a new API key"**
4. Give it a name (e.g., "EventFlow App")
5. Select permissions: **"Send emails"**
6. Copy the API key immediately (you won't see it again!)

### Step 3: Verify Sender Email

1. Go to **Settings** → **Senders & IP**
2. Click **"Add a sender"**
3. Enter your email address
4. Verify your email (check your inbox for verification link)

### Step 4: Add to Environment Variables

Add these to your `server/.env` file:

```env
BREVO_API_KEY=your-api-key-here
BREVO_SENDER_EMAIL=your-verified-email@example.com
```

### Email Features

- ✅ **Payment Confirmation**: Sent when payment is successfully processed
- ✅ **Cancellation Email**: Sent when a booking is cancelled
- ✅ **24-Hour Reminder**: Sent 24 hours before the event
- ✅ **1-Hour Reminder**: Sent 1 hour before the event

### Free Tier Limits

Brevo's free tier includes:
- **300 emails per day**
- **Unlimited contacts**
- **Email tracking and analytics**

## 🔔 Stripe Payment Setup with ngrok

For testing Stripe webhooks locally, you need to use ngrok to expose your local server to the internet.

### Step 1: Install ngrok

```bash
npm install -g ngrok

### Step 2: Get Stripe API Keys

1. Sign up for a [Stripe account](https://stripe.com)
2. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
3. Copy your **Publishable Key** and **Secret Key** (test mode)
4. Add them to your `.env` files (see Environment Variables section)

### Step 3: Start Your Backend Server

```bash
cd server
npm run server
```

### Step 4: Start ngrok Tunnel

In a new terminal:

```bash
ngrok http 5000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Step 5: Configure Stripe Webhook

1. Go to [Stripe Webhooks Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Enter your ngrok URL: `https://abc123.ngrok.io/api/payment/webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to `server/.env` as `STRIPE_WEBHOOK_SECRET`

### Step 6: Test Payment Flow

1. Use test card numbers from [Stripe Testing](https://stripe.com/docs/testing):
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Insufficient Funds**: `4000 0000 0000 9995`
2. Use any future expiry date (e.g., `12/25`)
3. Use any 3-digit CVV (e.g., `123`)

### Important Notes

- **ngrok URL changes**: Each time you restart ngrok, you get a new URL. Update the webhook endpoint in Stripe Dashboard.
- **Free ngrok limitations**: Free tier has session time limits. Consider ngrok paid plan for production.
- **Webhook secret**: Always use the webhook secret from Stripe Dashboard, not the default one.

## 📸 Screenshots

### Home/Events Page
![Events Page](./screenshots/events-page.png)
*Browse all available events with category and location filters*

### Event Detail Page
![Event Detail Page](./screenshots/event-detail.png)
*View event details and select date, time slot, and number of seats*

### Booking Confirmation Page
![Booking Page](./screenshots/booking-page.png)
*Confirm your booking details before proceeding to payment*

### Payment Page
![Payment Page](./screenshots/payment-page.png)
*Secure payment processing with Stripe Elements*

### My Bookings Page
![My Bookings](./screenshots/my-bookings.png)
*View and manage all your bookings*

### Login Page
![Login Page](./screenshots/login-page.png)
*User authentication page*

### Register Page
![Register Page](./screenshots/register-page.png)
*User registration page*


## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Events
- `GET /api/events` - Get all events (with optional filters: `?category=Concert&location=New York`)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)

### Bookings
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `PATCH /api/bookings/:id/confirm` - Confirm booking (after payment)

### Payments
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/confirm` - Confirm payment
- `POST /api/payment/webhook` - Stripe webhook endpoint
- `GET /api/payment/status/:bookingId` - Get payment status

## 📦 Version Details

### Node.js & npm
- **Node.js**: v18.0.0 or higher recommended
- **npm**: v9.0.0 or higher

### Frontend Dependencies
```
react: ^19.2.0
react-dom: ^19.2.0
react-router-dom: ^7.11.0
vite: ^7.2.4
tailwindcss: ^4.1.18
axios: ^1.13.2
react-hot-toast: ^2.6.0
@stripe/stripe-js: ^8.6.0
@stripe/react-stripe-js: ^5.4.1
```

### Backend Dependencies
```
express: ^5.2.1
mongoose: ^9.0.2
jsonwebtoken: ^9.0.3
bcryptjs: ^3.0.3
stripe: ^20.1.0
nodemailer: ^7.0.12
nodemailer-brevo-transport: ^2.2.1
node-cron: ^4.2.1
cors: ^2.8.5
cookie-parser: ^1.4.7
dotenv: ^17.2.3
```

### Database
- **MongoDB**: v6.0.0 or higher
- **Mongoose**: v9.0.2

## 🧪 Testing

### Test Cards (Stripe Test Mode)

| Card Number | Scenario | Expected Result |
|------------|----------|----------------|
| `4242 4242 4242 4242` | Success | Payment succeeds |
| `4000 0000 0000 0002` | Generic decline | Payment declined |
| `4000 0000 0000 9995` | Insufficient funds | Payment declined |
| `4000 0000 0000 9987` | Lost card | Payment declined |
| `4000 0000 0000 9979` | Stolen card | Payment declined |
| `4000 0000 0000 0069` | Expired card | Payment declined |
| `4000 0000 0000 0127` | Incorrect CVC | Payment declined |

