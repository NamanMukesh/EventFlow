# EventFlow Frontend

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the `client` folder:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 2. Install Dependencies (if not already done)

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173` (or another port if 5173 is taken)

## Pages Created

### ✅ Login Page (`/login`)
- Email and password authentication
- Links to register page
- Redirects to events after successful login

### ✅ Register Page (`/register`)
- Name, email, and password registration
- Links to login page
- Redirects to events after successful registration

### ✅ Events Page (`/events`)
- Browse all events
- Filter by category and location
- Shows event details (title, description, location, price, dates)
- Protected route (requires authentication)
- Logout functionality

## Features

- ✅ Authentication context for global user state
- ✅ Protected routes (redirects to login if not authenticated)
- ✅ Public routes (redirects to events if already logged in)
- ✅ Toast notifications for user feedback
- ✅ Responsive design with Tailwind CSS
- ✅ Loading states
- ✅ Error handling

## API Integration

The frontend connects to the backend API at `VITE_API_BASE_URL`:
- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/auth/logout` - User logout
- `/api/events` - Get all events (with filters)

## Next Steps

1. Add event detail page
2. Add booking functionality
3. Add payment integration with Stripe.js
4. Add user dashboard for bookings
5. Add admin panel

## Note

The linter warnings about file casing are Windows-specific and don't affect functionality. The code will work correctly.

