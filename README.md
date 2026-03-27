# Landscape Management Application

A full-stack web application for managing plants and gardening inventory with real-time synchronization, built with React, Express, tRPC, and PostgreSQL.

## Features

### Core Features
- **Plant Management:** Add, list, and delete plants with detailed information
- **Inventory Tracking:** Manage gardening supplies and equipment
- **User Authentication:** Secure Manus OAuth integration
- **Real-time Sync:** tRPC-powered type-safe API communication
- **Responsive Design:** Mobile-first UI with Tailwind CSS and shadcn/ui
- **Database Support:** PostgreSQL with fallback to mock data

### Technical Features
- **Type Safety:** End-to-end TypeScript with tRPC
- **CORS Enabled:** Cross-origin requests for distributed deployment
- **Production Ready:** Structured logging, error handling, and monitoring
- **Scalable Architecture:** Monorepo structure with clear separation of concerns
- **Environment Configuration:** Dynamic API URL configuration for multi-environment deployment

---

## Project Structure

```
landscape-app/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Plants.tsx    # Plant management UI
│   │   │   ├── Inventory.tsx # Inventory management UI
│   │   │   └── NotFound.tsx
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/
│   │   │   └── trpc.ts       # tRPC client configuration
│   │   ├── App.tsx           # Main app component with routing
│   │   ├── main.tsx          # Entry point with tRPC setup
│   │   └── index.css         # Global styles
│   ├── public/               # Static assets
│   └── index.html
├── server/                    # Express backend
│   ├── _core/                # Framework core
│   │   ├── index.ts          # Express server setup with CORS
│   │   ├── context.ts        # tRPC context
│   │   ├── trpc.ts           # tRPC router setup
│   │   └── ...
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   └── auth.logout.test.ts   # Example test
├── drizzle/                  # Database
│   ├── schema.ts             # Database schema (plants, inventory)
│   └── migrations/           # SQL migrations
├── shared/                   # Shared types and constants
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
├── drizzle.config.ts         # Drizzle ORM configuration
├── DEPLOYMENT.md             # Deployment guide
├── API.md                    # API documentation
├── README.md                 # This file
└── todo.md                   # Project progress tracker
```

---

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite 7** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **tRPC** - Type-safe API client
- **React Query** - Data fetching and caching
- **Wouter** - Lightweight routing

### Backend
- **Express 4** - Web framework
- **Node.js** - Runtime
- **tRPC 11** - Type-safe RPC
- **Drizzle ORM** - Database ORM
- **MySQL 2** - Database driver (can be switched to PostgreSQL)
- **CORS** - Cross-origin support

### Database
- **PostgreSQL** - Primary database (production)
- **Mock Data** - Fallback when DATABASE_URL unavailable

### DevOps
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **GitHub** - Version control

---

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database (for production)
- GitHub account
- Render and Vercel accounts (for deployment)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd landscape-app
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   Create `.env.local` in the project root:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/landscape
   NODE_ENV=development
   JWT_SECRET=dev-secret-key
   VITE_APP_ID=your-manus-app-id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
   VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
   VITE_FRONTEND_FORGE_API_KEY=your-api-key
   VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
   VITE_ANALYTICS_WEBSITE_ID=your-website-id
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

5. **Run database migrations:**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

---

## Available Scripts

### Development
```bash
pnpm dev              # Start development server
pnpm dev:frontend     # Start frontend only
pnpm dev:backend      # Start backend only
```

### Building
```bash
pnpm build            # Build frontend and backend
pnpm build:frontend   # Build frontend only
pnpm build:backend    # Build backend only
```

### Production
```bash
pnpm start            # Start production server
```

### Database
```bash
pnpm drizzle-kit generate   # Generate migrations
pnpm drizzle-kit migrate    # Apply migrations
pnpm db:push                # Generate and apply migrations
```

### Testing
```bash
pnpm test             # Run vitest tests
pnpm test:watch       # Run tests in watch mode
```

### Code Quality
```bash
pnpm check            # TypeScript type checking
pnpm format           # Format code with Prettier
```

---

## API Overview

### REST Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check | No |
| GET | `/api/migrate?secret=landscape-migrate-2024` | Database migration | No |
| POST | `/api/inpaint` | Image inpainting (placeholder) | No |
| GET | `/api/inventory` | Inventory list (placeholder) | No |

### tRPC Procedures

#### Authentication
- `auth.me` - Get current user
- `auth.logout` - Log out user

#### Plant Management
- `plants.create` - Add new plant
- `plants.list` - Get all plants
- `plants.delete` - Delete plant

#### Inventory Management
- `inventory.create` - Add inventory item
- `inventory.list` - Get all inventory items

See [API.md](./API.md) for detailed documentation.

---

## Database Schema

### Plants Table
```sql
CREATE TABLE plants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  species VARCHAR(255),
  location VARCHAR(255),
  wateringFrequency VARCHAR(50),
  lastWatered TIMESTAMP,
  imageUrl TEXT,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

### Inventory Items Table
```sql
CREATE TABLE inventoryItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  itemName VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 0,
  category VARCHAR(100),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Environment Variables

### Backend (Required)
- `NODE_ENV` - Environment mode (development/production)
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - Manus OAuth application ID
- `OAUTH_SERVER_URL` - Manus OAuth server URL

### Backend (Optional)
- `DATABASE_URL` - PostgreSQL connection string (uses mock if not provided)
- `PORT` - Server port (default: 3000, auto-set by Render)

### Frontend (Optional)
- `VITE_API_URL` - Backend API base URL (uses relative path if not provided)

### Frontend (Required)
- `VITE_APP_ID` - Manus OAuth application ID
- `VITE_OAUTH_PORTAL_URL` - Manus OAuth portal URL
- `VITE_FRONTEND_FORGE_API_URL` - Manus API URL
- `VITE_FRONTEND_FORGE_API_KEY` - Manus API key
- `VITE_ANALYTICS_ENDPOINT` - Analytics endpoint
- `VITE_ANALYTICS_WEBSITE_ID` - Analytics website ID

---

## Deployment

### Quick Start

1. **Backend (Render):**
   - Push code to GitHub
   - Create new Web Service on Render
   - Connect GitHub repository
   - Set environment variables
   - Deploy

2. **Frontend (Vercel):**
   - Create new project on Vercel
   - Connect GitHub repository
   - Set `VITE_API_URL` environment variable
   - Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## Features in Detail

### Plant Management
- Add plants with name, species, location, watering frequency, and notes
- View all plants in a responsive grid layout
- Delete plants with confirmation
- Real-time synchronization with backend

### Inventory Management
- Track gardening supplies and equipment
- Organize items by category
- View inventory in a table format
- Add items with quantity tracking

### Authentication
- Secure Manus OAuth integration
- Automatic session management
- Protected API endpoints
- User-specific data isolation

### API Configuration
- Dynamic API URL from environment variables
- Automatic fallback to relative paths
- CORS enabled for cross-origin requests
- Type-safe tRPC communication

---

## Error Handling

### Frontend
- Error boundaries for component crashes
- Toast notifications for user feedback
- Console logging for debugging
- Automatic redirect to login on auth errors

### Backend
- Structured error logging with prefixes
- Database connection fallback to mock mode
- CORS error handling
- Validation error messages

---

## Performance Optimization

### Frontend
- Code splitting with Vite
- Lazy loading of routes
- Optimized re-renders with React Query
- CSS minification with Tailwind

### Backend
- HTTP batch linking with tRPC
- Database connection pooling
- Efficient query helpers
- CORS caching

---

## Security

- **Authentication:** Manus OAuth with JWT tokens
- **CORS:** Configured for cross-origin requests
- **Database:** Parameterized queries prevent SQL injection
- **Environment Variables:** Secrets managed via environment
- **HTTPS:** Automatic SSL/TLS on Render and Vercel

---

## Monitoring & Logging

### Backend Logs
- Database connection status
- API request logging
- Migration execution logs
- Error tracking

### Frontend Logs
- tRPC client connection
- API errors and mutations
- User interactions
- Performance metrics

### Production Monitoring
- Render service logs
- Vercel deployment logs
- Browser console errors
- Database health checks

---

## Troubleshooting

### Common Issues

**CORS Error:**
- Verify `VITE_API_URL` is set correctly
- Check backend CORS middleware is enabled
- Ensure no trailing slash in API URL

**Database Connection Failed:**
- Verify `DATABASE_URL` is correct
- Check database is running
- Backend will use mock mode if DB unavailable

**tRPC Connection Failed:**
- Check backend is running
- Verify API URL in environment variables
- Check browser console for actual URL being used

**Authentication Error:**
- Verify Manus OAuth credentials
- Check JWT_SECRET is set
- Clear browser cookies and retry

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more troubleshooting tips.

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and type checking
4. Submit a pull request

---

## License

MIT

---

## Support

For issues or questions:
1. Check the [API documentation](./API.md)
2. Review the [Deployment guide](./DEPLOYMENT.md)
3. Check backend logs in Render dashboard
4. Check frontend logs in Vercel dashboard

---

## Roadmap

- [ ] Real image inpainting integration
- [ ] Plant health monitoring
- [ ] Watering reminders
- [ ] Plant photo gallery
- [ ] Advanced inventory management
- [ ] Export/import functionality
- [ ] Multi-user collaboration
- [ ] Mobile app

---

**Last Updated:** March 27, 2026
**Status:** Production Ready
**Version:** 1.0.0
