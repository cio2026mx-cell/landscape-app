# Landscape App - API Documentation

## Overview

The Landscape Management Application uses **tRPC** for type-safe API communication between frontend and backend. All API calls are routed through `/api/trpc` endpoint.

---

## Base URL

- **Development:** `http://localhost:3000/api/trpc`
- **Production:** `https://landscape-backend.onrender.com/api/trpc`

---

## Authentication

All protected procedures require authentication via Manus OAuth. The authentication token is automatically included in cookies.

### Public Procedures
- No authentication required
- Available to all users

### Protected Procedures
- Require valid authentication
- Returns `401 Unauthorized` if not authenticated
- User context available via `ctx.user`

---

## API Endpoints

### Health Check

**Endpoint:** `GET /api/health`

**Description:** Check backend health status and database connection mode

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-27T17:31:06.540Z",
  "mode": "real"
}
```

**Mode Values:**
- `"real"` - Connected to PostgreSQL database
- `"mock"` - Using mock data (DATABASE_URL not available)

---

### Database Migration

**Endpoint:** `GET /api/migrate?secret=landscape-migrate-2024`

**Description:** Create required database tables (idempotent operation)

**Query Parameters:**
- `secret` (required): Must be exactly `landscape-migrate-2024`

**Response (Success):**
```json
{
  "success": true,
  "message": "Database migration completed"
}
```

**Response (Invalid Secret):**
```json
{
  "success": false,
  "error": "Invalid migration secret"
}
```

**Status Codes:**
- `200 OK` - Migration successful
- `401 Unauthorized` - Invalid secret
- `500 Internal Server Error` - Database unavailable

---

### Inventory Endpoint

**Endpoint:** `GET /api/inventory`

**Description:** Placeholder for inventory management API

**Response:**
```json
{
  "success": true,
  "inventory": []
}
```

---

### Inpaint Endpoint

**Endpoint:** `POST /api/inpaint`

**Description:** Placeholder for image inpainting/processing API

**Request Body:**
```json
{
  "image": "base64-encoded-image",
  "mask": "base64-encoded-mask",
  "prompt": "description of what to inpaint"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inpaint endpoint ready"
}
```

---

## tRPC Procedures

### Authentication

#### `auth.me`
**Type:** Query (Public)

**Description:** Get current authenticated user

**Response:**
```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}
```

**Example (React):**
```typescript
const { data: user } = trpc.auth.me.useQuery();
```

---

#### `auth.logout`
**Type:** Mutation (Public)

**Description:** Clear session and log out user

**Response:**
```json
{ "success": true }
```

**Example (React):**
```typescript
const logout = trpc.auth.logout.useMutation({
  onSuccess: () => {
    window.location.href = "/";
  }
});

logout.mutate();
```

---

### Plant Management

#### `plants.create`
**Type:** Mutation (Protected)

**Input:**
```typescript
{
  name: string;              // Required, min 1 char
  species?: string;          // Optional
  location?: string;         // Optional
  wateringFrequency?: string;// Optional
  notes?: string;            // Optional
}
```

**Response:**
```typescript
{
  id: number;
  userId: number;
  name: string;
  species: string | null;
  location: string | null;
  wateringFrequency: string | null;
  lastWatered: Date | null;
  imageUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example (React):**
```typescript
const createPlant = trpc.plants.create.useMutation();

await createPlant.mutateAsync({
  name: "Monstera Deliciosa",
  species: "Monstera deliciosa",
  location: "Living Room",
  wateringFrequency: "Weekly",
  notes: "Thriving, needs more light"
});
```

**Error Handling:**
```typescript
createPlant.mutateAsync(data).catch(error => {
  console.error(error.message); // e.g., "Plant name is required"
});
```

---

#### `plants.list`
**Type:** Query (Protected)

**Input:** None

**Response:**
```typescript
Plant[]
```

**Example (React):**
```typescript
const { data: plants = [], isLoading } = trpc.plants.list.useQuery();

plants.forEach(plant => {
  console.log(`${plant.name} in ${plant.location}`);
});
```

---

#### `plants.delete`
**Type:** Mutation (Protected)

**Input:**
```typescript
{
  id: number; // Plant ID to delete
}
```

**Response:**
```json
{ "success": true }
```

**Example (React):**
```typescript
const deletePlant = trpc.plants.delete.useMutation();

await deletePlant.mutateAsync({ id: plantId });
```

**Error Handling:**
```typescript
deletePlant.mutateAsync({ id: plantId }).catch(error => {
  console.error(error.message); // e.g., "Failed to delete plant"
});
```

---

### Inventory Management

#### `inventory.create`
**Type:** Mutation (Protected)

**Input:**
```typescript
{
  itemName: string;    // Required, min 1 char
  quantity?: number;   // Optional, default 0
  category?: string;   // Optional
}
```

**Response:**
```typescript
{
  id: number;
  userId: number;
  itemName: string;
  quantity: number;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example (React):**
```typescript
const createItem = trpc.inventory.create.useMutation();

await createItem.mutateAsync({
  itemName: "Potting Soil",
  quantity: 5,
  category: "Soil"
});
```

---

#### `inventory.list`
**Type:** Query (Protected)

**Input:** None

**Response:**
```typescript
InventoryItem[]
```

**Example (React):**
```typescript
const { data: inventory = [] } = trpc.inventory.list.useQuery();

inventory.forEach(item => {
  console.log(`${item.itemName}: ${item.quantity} units`);
});
```

---

## Error Handling

### tRPC Error Format

All tRPC errors follow this format:

```typescript
{
  code: string;           // e.g., "UNAUTHORIZED", "BAD_REQUEST", "INTERNAL_SERVER_ERROR"
  message: string;        // Human-readable error message
  data?: {
    zodError?: object;    // Zod validation errors (if applicable)
  }
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks permission |
| `BAD_REQUEST` | 400 | Invalid input data |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

### Error Handling Example

```typescript
const createPlant = trpc.plants.create.useMutation({
  onError: (error) => {
    if (error.code === "UNAUTHORIZED") {
      // Redirect to login
      window.location.href = getLoginUrl();
    } else if (error.code === "BAD_REQUEST") {
      // Show validation error
      console.error(error.message);
    } else {
      // Show generic error
      toast.error("An error occurred");
    }
  }
});
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding:
- Per-user rate limits (e.g., 100 requests/minute)
- Per-IP rate limits (e.g., 1000 requests/minute)
- Endpoint-specific limits

---

## Logging

### Backend Logging

All API operations are logged with `[API]`, `[Database]`, or `[Migration]` prefixes:

```
[Database] Connected to PostgreSQL via DATABASE_URL
[API] Inpaint request received
[Migration] Starting database migration
```

### Frontend Logging

All tRPC operations are logged with `[tRPC]` or `[App]` prefixes:

```
[App] Starting Landscape Management Application
[tRPC Client] Connecting to: https://landscape-backend.onrender.com/api/trpc
[API Query Error] Error details
```

---

## Pagination

Currently not implemented. For future enhancement:

```typescript
// Proposed pagination support
plants.list.input({
  limit: 10,
  offset: 0,
  sortBy: "createdAt",
  sortOrder: "desc"
})
```

---

## Batch Requests

tRPC automatically batches multiple requests into a single HTTP call for efficiency. No manual configuration required.

---

## CORS Headers

All responses include CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Request/Response Examples

### Create Plant (Full Flow)

**Request:**
```typescript
POST /api/trpc
Content-Type: application/json

{
  "0": {
    "jsonrpc": "2.0",
    "method": "mutation",
    "params": {
      "path": "plants.create",
      "input": {
        "name": "Monstera",
        "species": "Monstera deliciosa",
        "location": "Living Room"
      }
    },
    "id": 1
  }
}
```

**Response:**
```json
{
  "0": {
    "result": {
      "data": {
        "id": 1,
        "userId": 1,
        "name": "Monstera",
        "species": "Monstera deliciosa",
        "location": "Living Room",
        "wateringFrequency": null,
        "lastWatered": null,
        "imageUrl": null,
        "notes": null,
        "createdAt": "2026-03-27T17:31:06.540Z",
        "updatedAt": "2026-03-27T17:31:06.540Z"
      }
    }
  }
}
```

---

## WebSocket Support

Currently not implemented. Backend supports Socket.io integration if needed for real-time updates.

---

## Versioning

API versioning is not currently implemented. All endpoints use the current version.

For future versioning, consider:
- URL-based: `/api/v1/trpc`
- Header-based: `X-API-Version: 1`

---

## Deprecation Policy

No endpoints are currently deprecated. When deprecation occurs, users will be notified 30 days in advance.

---

## Support

For API issues or questions:
1. Check browser console logs
2. Review backend logs in Render dashboard
3. Verify environment variables are correctly set
4. Check database connection status via `/api/health`

---

**Last Updated:** March 27, 2026
**API Version:** 1.0.0
**Status:** Production Ready
