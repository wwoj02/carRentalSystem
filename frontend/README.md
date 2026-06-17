# Car Rental System - Frontend

A modern, responsive React + TypeScript frontend for a car rental management system, built with Vite and Tailwind CSS.

## Features

- 🚗 **Vehicle Browsing** - Browse and filter available vehicles
- 🔍 **Advanced Filtering** - Filter by type, brand, model, price range, drive type
- 📅 **Reservation System** - Easy-to-use reservation form with date selection
- 👤 **User Authentication** - Simple user registration/login system
- 📜 **Booking History** - View and manage your reservations
- 🔐 **Admin Panel** - Full vehicle and reservation management
- 💰 **Price Calculation** - Automatic price calculation based on rental duration
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **React Router v7** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **date-fns** - Date utilities

## Project Structure

```
frontend/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── common/              # Common components (Button, Card, Modal, etc.)
│   │   ├── forms/               # Form components
│   │   └── layout/              # Layout components (Navbar, Footer)
│   ├── pages/                   # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── VehicleList.tsx
│   │   ├── VehicleDetail.tsx
│   │   ├── BookingHistory.tsx
│   │   ├── AdminPanel.tsx
│   │   └── NotFound.tsx
│   ├── services/                # API services
│   │   ├── api.ts               # Axios configuration
│   │   ├── vehicleService.ts
│   │   ├── userService.ts
│   │   ├── reservationService.ts
│   │   └── paymentService.ts
│   ├── types/                   # TypeScript type definitions
│   ├── hooks/                   # Custom React hooks
│   ├── store/                   # Zustand store
│   ├── utils/                   # Utility functions
│   ├── App.tsx                  # Main app component with routing
│   ├── main.tsx                 # React DOM entry point
│   └── index.css                # Global styles
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Setup & Installation

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Backend API running on `http://localhost:8080` (configurable)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional, for non-default API URL):
   ```bash
   cp .env.example .env
   # Edit .env to change VITE_API_BASE_URL if backend is on a different URL
   ```

## Running the Frontend

### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## API Integration

The frontend connects to a Spring Boot backend. The API base URL is configured in:
- **Development**: Through the Vite dev proxy in `vite.config.ts`
- **Environment variable**: `VITE_API_BASE_URL` (defaults to `http://localhost:8080/api`)

### Available Backend Endpoints Used

**Vehicles:**
- `GET /api/vehicles` - List vehicles with filtering
- `GET /api/vehicles/{id}` - Get vehicle details
- `POST /api/vehicles` - Create vehicle (admin)
- `PUT /api/vehicles/{id}` - Update vehicle (admin)
- `DELETE /api/vehicles/{id}` - Delete vehicle (admin)

**Users:**
- `GET /api/users` - List all users (admin)
- `POST /api/users` - Register/login user

**Reservations:**
- `POST /api/reservations` - Create reservation
- `GET /api/reservations` - List all reservations (admin)
- `GET /api/reservations/user/{userId}` - Get user's reservations
- `PATCH /api/reservations/{id}/cancel` - Cancel reservation

**Payments:**
- `POST /api/payments` - Create payment
- `GET /api/payments/{id}` - Get payment details

## User Workflows

### Customer Flow

1. **Home** - View introduction and get started
2. **Browse Vehicles** - See all available vehicles with filters
3. **Vehicle Details** - View vehicle information and reserve
4. **Reservation** - Fill form with dates and user ID, confirm
5. **Booking History** - View, manage, and cancel reservations

### Admin Flow

1. **Admin Panel** - Access management dashboard
2. **Vehicle Management** - Add, edit, delete vehicles
3. **User Management** - View all registered users
4. **Reservation Management** - Monitor all reservations and their statuses

## Deployment

### To Deploy on GitHub Pages

1. Update `vite.config.ts` with your repository name (if deploying to a subdirectory)
2. Run: `npm run build`
3. Deploy the `dist/` folder to your hosting platform

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t car-rental-frontend .
docker run -p 80:80 car-rental-frontend
```

## Configuration

### Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:8080/api`)

### Tailwind CSS

Customization available in `tailwind.config.js`:
- Colors, spacing, fonts, and more
- Currently extends with primary and secondary colors

## Features & Implementation Notes

### State Management

- **Global State**: Zustand store for user context and notifications
- **Local State**: React hooks for component-level data

### Form Validation

- Client-side validation for all forms
- Error messages displayed to users
- Field-level error states

### Notifications

- Toast notifications for success/error messages
- Auto-dismiss after 3 seconds
- Different variants for different message types

### Date Handling

- Uses `date-fns` for reliable date operations
- Automatic rental duration and price calculation
- ISO date format for API communication

### Responsive Design

- Mobile-first approach
- Tailwind CSS responsive utilities
- Grid and flexbox layouts
- Touch-friendly interfaces

## Known Limitations & Backend Gaps

### Missing Backend Features

1. **Authentication** - Backend doesn't have proper login endpoint with tokens
   - **Workaround**: Using localStorage to persist user context
   - **Note**: All users can access admin features

2. **Payment Processing** - Payment endpoint exists but lacks details
   - **Current**: Mock payment flow
   - **Suggestion**: Integrate with actual payment provider

3. **Returns & Damage Reports** - No backend endpoint for vehicle returns
   - **Workaround**: Reservations can be marked complete via admin

4. **Email Notifications** - No email confirmation system
   - **Suggestion**: Add confirmation emails via backend

5. **CORS Configuration** - Backend allows all origins
   - **Current**: Works in development
   - **Suggestion**: Configure CORS properly for production

### Frontend Limitations

- Pagination not implemented (shows first 10 items in admin tables)
- Real-time updates not implemented
- Search functionality limited to backend filter parameters
- Image upload not implemented (image URL only)
- File uploads for documents not supported

## Troubleshooting

### API Connection Issues

If you see errors connecting to the backend:

1. Ensure backend is running on `http://localhost:8080`
2. Check CORS is properly configured on backend
3. Verify `VITE_API_BASE_URL` in `.env` matches your backend URL
4. Check browser console for detailed error messages

### Build Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf dist .vite
npm run build
```

### Hot Module Replacement (HMR) Not Working

This is typically a Vite configuration issue. Ensure `vite.config.ts` has proper HMR settings for your environment.

## Performance Optimization

- Lazy loading routes
- Image optimization in Tailwind (use optimized URLs)
- Code splitting via Vite
- Minification in production build

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Guidelines for contributing to this frontend:

1. Follow existing code structure and naming conventions
2. Use TypeScript for type safety
3. Create reusable components
4. Write descriptive commit messages
5. Test responsive design

## License

This project is part of an academic assignment and is for educational purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the component and service implementations
3. Check the browser console for error details
4. Verify backend API is running and accessible
