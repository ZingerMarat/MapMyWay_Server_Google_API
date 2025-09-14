# MapMyWay Server API

## Overview

MapMyWay Server provides a REST API for trip planning using Google Maps services. It supports geocoding, directions, places search, and trip planning with category preferences. Redis is used for caching to improve performance and reduce API costs.

---

## Data Flow

1. **Trip Planning Request**

- User sends a request with origin, destination, travel mode, and preferences (categories).

2. **Geocoding**

- The server geocodes the origin and destination addresses to coordinates (lat/lng).
- Results are cached in Redis.

3. **Directions**

- The server requests a route (polyline) between the coordinates from Google Directions API.
- Result is cached in Redis.

4. **Category Mapping**

- User preferences are mapped to Google Places categories using `mapping.json`.

5. **Places Search**

- The route polyline is decoded into checkpoints.
- For each checkpoint and category, the server searches for nearby places using Google Places API.
- Results are deduplicated and cached in Redis.

6. **Response**

- The server returns the trip plan: route, places along the route, and summary info.

---

## API Endpoints

### `/api/geocode` (GET)

- **Description:** Geocode an address to coordinates.
- **Query Params:** `address` (string)
- **Response:** `{ address, coords: { lat, lng } }`

### `/api/directions` (POST)

- **Description:** Get directions between two points.
- **Body:** `{ start: { lat, lng }, end: { lat, lng }, mode: "driving" | "walking" | "bicycling" }`
- **Response:** `{ distance, duration, polyline, start_location, end_location }`

### `/api/places/onroute` (POST)

- **Description:** Find places along a route polyline.
- **Body:** `{ polyline: string, categories: [ { type, keyword? } ], radius?: number }`
- **Response:** `{ checkpoints: number, places: [ ... ] }`

### `/api/trip/plan` (POST)

- **Description:** Plan a trip with places of interest along the route.
- **Body:**
  ```json
  {
    "origin": "Tbilisi",
    "destination": "Batumi",
    "mode": "driving",
    "preferences": {
      "activities": ["museum", "park"],
      "food": ["vegan", "georgian"]
    },
    "radius": 3000
  }
  ```
- **Response:**
  ```json
  {
   "origin": "Tbilisi",
   "destination": "Batumi",
   "start": { "lat": ..., "lng": ... },
   "end": { "lat": ..., "lng": ... },
   "polyline": "...",
   "places": [ ... ]
  }
  ```

### `/api/categories` (GET)

- **Description:** Get all available categories from `mapping.json`.

### `/redis/*`

- **Admin endpoints for Redis cache management.**

---

## Service Descriptions

### Geocoding Service

- **Input:** Address string.
- **Output:** `{ lat, lng }`
- **Description:** Converts an address to coordinates using Google Geocoding API. Uses Redis for caching.

### Directions Service

- **Input:** Start/end coordinates, travel mode.
- **Output:** Route info (distance, duration, polyline, start/end).
- **Description:** Gets route info from Google Directions API. Uses Redis for caching.

### Places Service

- **Input:** Location (lat,lng), category, radius.
- **Output:** Array of places.
- **Description:** Finds places near a location using Google Places API. Used for both single-point and along-route searches. Uses Redis for caching.

### Planner Service

- **Input:** Origin, destination, mode, preferences, radius.
- **Output:** Trip plan (route, places, summary).
- **Description:** Orchestrates geocoding, directions, category mapping, and places search to build a full trip plan.

---

## Improvements & Recommendations

- Add input validation and error handling for all endpoints.
- Add request logging and rate limiting.
- Expand test coverage.
- Document all endpoints and data structures.
- Secure admin endpoints.

---

## Setup

1. Install dependencies: `npm install`
2. Set up `.env` with your Google API key and desired port.
3. Start Redis server locally.
4. Run the server: `npm start`

---

## License

MIT
