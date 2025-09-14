# Optimized API Usage Examples

## Overview of Changes

The code has been optimized to improve object transfer between services and preserve clear variable names:

### ✅ What's improved:

1. **Typed data models** - Clear structures created for all objects
2. **Clear variable names** - `latitude/longitude` instead of `lat/lng`
3. **Structured responses** - Logically organized objects in API responses
4. **Enhanced validation** - Detailed input data validation
5. **Error codes** - Standardized codes for error handling
6. **Backward compatibility** - Preserved work with existing clients

---

## API Request Examples

### 1. Address Geocoding

**Request:**
```bash
GET /api/geocode?address=Tbilisi, Georgia
```

**Response:**
```json
{
  "originalAddress": "Tbilisi, Georgia",
  "coordinates": {
    "latitude": 41.7151,
    "longitude": 44.8271
  },
  "formattedAddress": "Tbilisi, Georgia",
  "placeId": "ChIJ2VhMz4MZ6kAR9Q5VBWrOKSk",
  "coordinatesString": "41.7151,44.8271"
}
```

### 2. Get Route

**Request:**
```bash
POST /api/directions
Content-Type: application/json

{
  "start": { "lat": 41.7151, "lng": 44.8271 },
  "end": { "lat": 41.6168, "lng": 41.6367 },
  "mode": "driving"
}
```

**Response:**
```json
{
  "route": {
    "distance": {
      "text": "250 km",
      "value": 250000
    },
    "duration": {
      "text": "3 hours 30 minutes",
      "value": 12600
    },
    "polyline": "encoded_polyline_string",
    "travelMode": "driving"
  },
  "startLocation": {
    "coordinates": {
      "latitude": 41.7151,
      "longitude": 44.8271
    },
    "address": "Tbilisi, Georgia"
  },
  "endLocation": {
    "coordinates": {
      "latitude": 41.6168,
      "longitude": 41.6367
    },
    "address": "Batumi, Georgia"
  }
}
```

### 3. Search Places Along Route

**Request:**
```bash
POST /api/places/onroute
Content-Type: application/json

{
  "polyline": "encoded_polyline_string",
  "categories": [
    { "type": "museum" },
    { "type": "restaurant", "keyword": "georgian" }
  ],
  "radius": 3000
}
```

**Response:**
```json
{
  "searchInfo": {
    "totalCheckpoints": 10,
    "searchedCategories": [
      { "type": "museum", "keyword": null },
      { "type": "restaurant", "keyword": "georgian" }
    ],
    "searchRadius": 3000
  },
  "places": [
    {
      "placeId": "ChIJ...",
      "name": "Georgian Restaurant",
      "coordinates": {
        "latitude": 41.7200,
        "longitude": 44.8300
      },
      "address": "Rustaveli Ave, Tbilisi",
      "category": {
        "type": "restaurant",
        "keyword": "georgian"
      },
      "rating": 4.5,
      "priceLevel": 2,
      "openingHours": { "open_now": true },
      "types": ["restaurant", "food", "establishment"]
    }
  ],
  "summary": {
    "totalPlaces": 5,
    "categoriesFound": ["restaurant", "museum"]
  }
}
```

### 4. Trip Planning

**Request:**
```bash
POST /api/trip/plan
Content-Type: application/json

{
  "origin": "Tbilisi",
  "destination": "Batumi",
  "mode": "driving",
  "preferences": {
    "activities": ["museum", "park"],
    "food": ["georgian", "vegan"]
  },
  "radius": 3000
}
```

**Response:**
```json
{
  "tripInfo": {
    "origin": "Tbilisi",
    "destination": "Batumi",
    "travelMode": "driving",
    "searchRadius": 3000
  },
  "route": {
    "distance": {
      "text": "250 km",
      "value": 250000
    },
    "duration": {
      "text": "3 hours 30 minutes",
      "value": 12600
    },
    "polyline": "encoded_polyline_string"
  },
  "locations": {
    "start": {
      "coordinates": {
        "latitude": 41.7151,
        "longitude": 44.8271
      },
      "address": "Tbilisi, Georgia",
      "placeId": "ChIJ2VhMz4MZ6kAR9Q5VBWrOKSk"
    },
    "end": {
      "coordinates": {
        "latitude": 41.6168,
        "longitude": 41.6367
      },
      "address": "Batumi, Georgia",
      "placeId": "ChIJ..."
    }
  },
  "places": [
    {
      "placeId": "ChIJ...",
      "name": "National Museum of Georgia",
      "coordinates": {
        "latitude": 41.7200,
        "longitude": 44.8300
      },
      "address": "Rustaveli Ave, Tbilisi",
      "category": {
        "type": "museum",
        "keyword": null
      },
      "rating": 4.2,
      "priceLevel": 1,
      "openingHours": { "open_now": true },
      "types": ["museum", "tourist_attraction", "establishment"]
    }
  ],
  "preferences": {
    "activities": ["museum", "park"],
    "food": ["georgian", "vegan"]
  },
  "summary": {
    "totalPlaces": 8,
    "categoriesFound": ["museum", "restaurant", "park"],
    "estimatedDistance": "250 km",
    "estimatedDuration": "3 hours 30 minutes"
  }
}
```

---

## Error Codes

### Geocoding
- `MISSING_ADDRESS` - Address parameter is missing
- `GEOCODING_ERROR` - Google Geocoding API error

### Directions
- `MISSING_COORDINATES` - Start/end parameters are missing
- `INVALID_COORDINATES` - Invalid coordinates
- `DIRECTIONS_ERROR` - Google Directions API error

### Places
- `MISSING_POLYLINE` - Polyline parameter is missing
- `MISSING_CATEGORIES` - Categories are missing or invalid
- `PLACES_SEARCH_ERROR` - Google Places API error

### Trip Planning
- `MISSING_LOCATIONS` - Origin/destination are missing
- `MISSING_PREFERENCES` - Preferences are missing
- `TRIP_PLANNING_ERROR` - General planning error

---

## Optimization Benefits

### 1. **Code Readability**
```javascript
// Before:
const coords = { lat: 41.7151, lng: 44.8271 }

// After:
const coordinates = { latitude: 41.7151, longitude: 44.8271 }
```

### 2. **Typed Objects**
```javascript
// Creating geocoded address
const geocodedAddress = createGeocodedAddress(
  "Tbilisi",
  createCoordinates(41.7151, 44.8271),
  "Tbilisi, Georgia",
  "ChIJ2VhMz4MZ6kAR9Q5VBWrOKSk"
)
```

### 3. **Structured Responses**
```javascript
// Logically organized response structure
{
  "tripInfo": { /* trip information */ },
  "route": { /* route */ },
  "locations": { /* points */ },
  "places": [ /* places */ ],
  "summary": { /* summary */ }
}
```

### 4. **Enhanced Error Handling**
```javascript
// Detailed error codes for clients
{
  "error": "Address parameter is required",
  "code": "MISSING_ADDRESS"
}
```

### 5. **Backward Compatibility**
```javascript
// Legacy functions for existing clients
export const fetchDirectionsLegacy = async (start, end, mode) => {
  // Convert to new types
}
```

---

## Code Migration

### For API Clients:
1. **Update response handling** - use new data structures
2. **Add error code handling** - for better UX
3. **Use new field names** - `latitude/longitude` instead of `lat/lng`

### For Developers:
1. **Use typed models** - import from `models/index.js`
2. **Create objects via factory functions** - `createCoordinates()`, `createPlace()`, etc.
3. **Add JSDoc comments** - for better documentation
4. **Use clear variable names** - `startLocation` instead of `start`
