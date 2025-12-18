# Community Event Board

A comprehensive local community event discovery platform with payment integration, built with Node.js, TypeScript, and React.

## Features

### 🎯 Core Features
- **Event Discovery**: Search events by location, category, date, and preferences
- **Event Management**: Create, update, and manage events with capacity tracking
- **User Registration**: Secure authentication with email/phone verification
- **Real-time Updates**: Live notifications and capacity updates
- **Review System**: Rate and review attended events

### 💳 Payment & Subscriptions
- **Multiple Plans**: Free, Premium (₹299/month), Pro (₹599/month)
- **Ticket Sales**: Sell tickets for paid events with QR code generation
- **Razorpay Integration**: Secure INR payment processing
- **Revenue Analytics**: Detailed financial reporting for organizers

### 🛡️ Security & Compliance
- **GDPR Compliant**: Data export, deletion, and privacy controls
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized for 10K+ concurrent users
- **Security**: HTTPS, encryption, rate limiting

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Payments**: Razorpay
- **Real-time**: Socket.IO

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Maps**: Google Maps API

### Testing
- **Unit Tests**: Jest
- **Property-Based Tests**: fast-check
- **E2E Tests**: Playwright
- **Coverage**: 90%+ target

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd community-event-board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb community_events
   
   # Run migrations (when implemented)
   npm run migrate
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

The API server will run on `http://localhost:3000` and the frontend on `http://localhost:3001`.

## Project Structure

```
src/
├── server/                 # Backend application
│   ├── controllers/        # API controllers
│   ├── services/          # Business logic services
│   ├── repositories/      # Data access layer
│   ├── middleware/        # Express middleware
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
├── client/               # Frontend React application
├── shared/               # Shared types and models
│   ├── types/           # TypeScript type definitions
│   ├── models/          # Data models
│   └── interfaces/      # Service interfaces
└── test/                # Test utilities and setup
```

## API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### Events
- `GET /api/events` - Search events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Payments
- `POST /api/payments/subscriptions` - Create subscription
- `POST /api/payments/tickets` - Purchase tickets
- `GET /api/payments/transactions` - Get transactions

## Development

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Building for Production
```bash
# Build both server and client
npm run build

# Start production server
npm start
```

## Deployment

### Environment Variables
See `.env.example` for all required environment variables.

### Database Setup
1. Create PostgreSQL database
2. Run migrations
3. Seed initial data (categories, admin user)

### Payment Setup
1. Create Razorpay account
2. Get API keys and webhook secrets
3. Configure webhook endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@communityevents.com or create an issue in the repository.