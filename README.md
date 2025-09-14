# MapMyWay Server API

## Description

This server provides an API for working with Google Maps and related services. Below are the main routes, their methods, parameters, and response examples.

---

## /api/geocode

### POST /api/geocode

**Description:**
Converts an address to coordinates (geocoding) or coordinates to an address (reverse geocoding).

**Request body (example):**

```json
{
  "address": "Moscow, Red Square"
}
```

or

```json
{
  "lat": 55.753215,
  "lng": 37.622504
}
```

**Response (example):**

```json
{
  "lat": 55.753215,
  "lng": 37.622504
}
```

---

## /api/directions

### POST /api/directions

**Description:**
Builds a route between two points using the Google Directions API.

**Request body (example):**

```json
{
  "origin": "41.6937645,44.8014458",
  "destination": "41.6461533,41.64056",
  "mode": "driving" //mode is "driving", "walking" or "bicycling"
}
```

**Response (example):**

```json
{
  "distance": { "text": "357 km", "value": 356987 },
  "duration": { "text": "4 hours 44 mins", "value": 17030 },
  "polyline": "_in}FahmpGwd@|[kV|d@sVmEmZ...",
  "start_location": { "lat": 41.6937645, "lng": 44.8014458 },
  "end_location": { "lat": 41.64615329999999, "lng": 41.64056 }
}
```

**Field descriptions:**

- `distance`: Total route distance (text and value in meters)
- `duration`: Estimated travel time (text and value in seconds)
- `polyline`: Encoded polyline string for drawing the route on a map
- `start_location`: Latitude and longitude of the starting point
- `end_location`: Latitude and longitude of the destination

---

> Descriptions for other routes will be added later.
