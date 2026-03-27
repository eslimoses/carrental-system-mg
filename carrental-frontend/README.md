# Car Rental System - Frontend

A modern React TypeScript application for managing car rentals with role-based access control.

## Features

- **User Authentication**: Login and registration for customers and admins
- **Vehicle Search**: Filter vehicles by city and category
- **Booking Management**: Create, view, and manage bookings
- **Payment Processing**: Advance and rental payment handling
- **Bill Generation**: Automatic bill generation and notifications
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## Tech Stack

- **React 18** with TypeScript
- **React Router DOM** for navigation
- **React Query** for data fetching and caching
- **Axios** for HTTP requests
- **Tailwind CSS** for styling
- **Vite** for build tooling

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── api/              # API client and endpoints
├── components/       # React components
│   ├── Auth/        # Authentication components
│   ├── Customer/    # Customer-facing components
│   ├── Layout/      # Layout components
│   └── Payment/     # Payment components
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── App.tsx          # Main App component
└── main.tsx         # Entry point
```

## Custom Hooks

- `useAuth`: Authentication and user management
- `useVehicles`: Vehicle data fetching
- `useBooking`: Booking operations
- `usePayment`: Payment processing
- `useBill`: Bill management

## API Integration

The frontend communicates with the Spring Boot backend at `http://localhost:8080/api`

## Notes

- All components are functional components (no class components)
- Uses React Query for efficient data management
- Implements custom hooks for reusable logic
- Tailwind CSS for responsive design
