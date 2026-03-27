# Landscape App - Production Deployment TODO

## Phase 1: Backend Infrastructure
- [x] Configure Express server with dynamic PORT from environment
- [x] Implement CORS middleware with origin: "*" and credentials: true
- [x] Setup PostgreSQL connection with DATABASE_URL and mock fallback
- [x] Add database connection logging (connection status, mode: real/mock)
- [x] Implement migration endpoint GET /api/migrate?secret=landscape-migrate-2024

## Phase 2: Database & tRPC Procedures
- [x] Create plants table schema in drizzle/schema.ts
- [x] Generate and apply database migrations
- [x] Implement plant CRUD procedures in server/routers.ts:
  - [x] plants.create (add plant with validation)
  - [x] plants.list (retrieve all plants)
  - [x] plants.delete (remove plant by ID)
- [x] Add database query helpers in server/db.ts

## Phase 3: Frontend Configuration
- [x] Configure VITE_API_URL environment variable handling
- [x] Update client/src/lib/trpc.ts with dynamic API_BASE_URL construction
- [x] Ensure no /api/trpc suffix or trailing slash appended to VITE_API_URL
- [x] Test tRPC client connection to backend

## Phase 4: Plant Management UI
- [x] Create plant list page component
- [x] Implement add plant form with validation
- [x] Implement delete plant functionality with confirmation
- [x] Add loading and error states to UI components

## Phase 5: Image Processing & Inpaint
- [x] Implement /api/inpaint endpoint for image processing
- [x] Create /api/inventory endpoint for inventory management
- [x] Add image upload and processing UI component
- [x] Integrate inpaint API with frontend

## Phase 6: Logging & Error Handling
- [x] Add structured logging for database operations
- [x] Implement API error logging with request/response context
- [x] Add frontend error boundary and error logging
- [x] Create production-ready error messages

## Phase 7: Testing & Validation
- [x] Write vitest tests for plant CRUD operations
- [x] Test database connection (real and mock modes)
- [x] Validate migration endpoint with correct secret
- [x] Test CORS configuration with cross-origin requests
- [x] Verify tRPC client-server communication

## Phase 8: Deployment Configuration
- [x] Create Render deployment configuration
- [x] Create Vercel deployment configuration
- [x] Document environment variables for both platforms
- [x] Create deployment checklist

## Phase 9: Final Validation & Delivery
- [x] Verify all CRUD operations work end-to-end
- [x] Confirm logging output in production mode
- [x] Test with real PostgreSQL connection
- [x] Create checkpoint and prepare for deployment
