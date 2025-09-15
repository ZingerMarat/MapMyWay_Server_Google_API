# 🗺 Trip Planning API

An API for automatically planning travel routes between two locations based on user preferences.  
It uses **Google Directions API**, **Google Places API**, and **Gemini** to generate a multi-day itinerary.

## Project overview

This repository implements a Trip Planning API that generates a route and suggested places along the route based on user preferences. The server uses Google Maps APIs (Directions, Places, Geocoding) together with a planning layer that assembles results into a structured trip plan. An AI-assisted component (Gemini via the `@google/genai` package) can be used to produce day-by-day itinerary suggestions from the collected places.

The implementation is intentionally modular: small services perform individual tasks (geocoding, routing, place search, mapping of user preferences). Controllers expose HTTP endpoints and compose service results into the JSON payloads shown earlier in this README.

## Architecture & data flow

- Client -> POST `/api/trip/planTrip` or POST `/api/trip/tripPath`
- `planner.service` coordinates the flow:
  1. Geocode origin and destination using `geocoding.service`.
  2. Request route from `directions.service` and extract an overview polyline.
  3. Map user `preferences` to Google Places categories using `utils/mappingLoader.js` and `mapping.json`.
  4. Search for places along the route using `places.service` (checks multiple checkpoints along the polyline).
  5. Compose `TripPlan` object and optionally send a compact set of place data to the Gemini/AI service to generate an itinerary (`gemini.service`).
  6. Controller responds with the final JSON (tripInfo, originInfo, destinationInfo, geminiPlan etc.).

## Services — inputs and outputs

- `geocoding.service`

  - Input: address string (e.g. city name, address, or `"lat,lng"`).
  - Output: `GeocodedAddress` object: `{ originalAddress, coordinates: { latitude, longitude }, formattedAddress, placeId }`.

- `directions.service`

  - Input: two `GeocodedAddress` objects (start, end) and optional travel mode (`driving|walking|bicycling`).
  - Output: `Route` object containing `{ distance, duration, polyline, startLocation, endLocation, travelMode }` (distance/duration include text and numeric values).

- `places.service`

  - Input: an encoded polyline string, an array of `PlaceCategory` (e.g. `{ type, keyword }`), and search radius in meters.
  - Output: `PlacesSearchResult` — `{ totalCheckpoints, places: Place[], searchedCategories }` where each `Place` contains `{ placeId, name, coordinates, address, rating, types, openingHours, category, ... }`.

- `planner.service`

  - Input: `{ origin, destination, travelMode?, preferences, searchRadius? }`.
  - Output: `TripPlan` — top-level object combining geocoded start/end, `Route`, `places` array and the `preferences` used.

- `gemini.service` (AI)
  - Input: a compact object with `startPoint`, `endPoint`, `days`, and `places` (ids + minimal metadata).
  - Output: an AI-generated itinerary object with `itinerary` per day and candidate options for each category. This output is merged with full place details by the controller.

## Utilities and models

- `utils/mappingLoader.js` + `mapping.json` — maps user-friendly preference keys (e.g. `museum`, `fast_food`) to Google Places search categories and optional keywords.
- `models/index.js` — central factory functions and JSDoc typedefs used across services (`createCoordinates`, `createGeocodedAddress`, `createPlace`, `createTripPlan`, helpers like `coordinatesToString`, etc.). Keep this file: it documents contracts and simplifies creating consistent objects inside services.

## Environment variables

- `GOOGLE_API_KEY` — required to call Google Maps web APIs (Geocoding/Places/Directions). Set this in a `.env` file or environment before running.
- `PORT` — optional, defaults to `3000`.
- `GOOGLE_GEMINI_API_KEY` (Gemini / GenAI credentials) — if you use the `gemini.service` you must configure the credentials according to the `@google/genai` package documentation (service account or API key as required).

## Running locally

1. Install dependencies:

```bash
npm install
```

2. Start the server (development):

```bash
npm start
```

3. Call the API endpoints shown above (example: `POST /api/trip/planTrip`).

---

## 📍 Endpoint

```
POST /api/trip/plantrip
```

Purpose: This endpoint plans a trip end-to-end. Given `origin`, `destination`, optional `mode` and `preferences`, the server will:

- Geocode the start and end points.
- Build a driving/walking/bicycling route between them and extract an overview polyline.
- Map user preferences to Places categories and search for candidate places along the route.
- Compose a `TripPlan` object containing route info, found places, and user preferences. Optionally, it can call the Gemini AI service to generate a day-by-day itinerary which is returned in the `geminiPlan` field.

Use this endpoint when you want the server to generate suggested places and an organized itinerary based on user preferences.

## 📥 Request Body

**Content-Type:** `application/json`

```json
{
  "origin": "Tbilisi",
  "destination": "Batumi",
  "mode": "driving",
  "days": 2,
  "preferences": {
    "activities": ["museum"],
    "food": ["fast_food"]
  }
}
```

### Fields

| Field         | Type   | Required | Description                                                                                         |
| ------------- | ------ | -------- | --------------------------------------------------------------------------------------------------- |
| `origin`      | string | ✅       | Starting point (city name, address, or `"lat,lng"` coordinates)                                     |
| `destination` | string | ✅       | Destination point (city name, address, or `"lat,lng"` coordinates)                                  |
| `mode`        | string | ❌       | Travel mode: `driving` (default), `walking`, or `bicycling`                                         |
| `days`        | number | ❌       | Number of days to split the itinerary                                                               |
| `preferences` | object | ✅       | User preferences. Keys are categories (e.g. `activities`, `food`) and values are arrays of keywords |

---

## 📤 Response Body

**Content-Type:** `application/json`

```jsonc
{
  "tripInfo": {
    "origin": "Tbilisi",
    "destination": "Batumi",
    "travelMode": "driving",
    "searchRadius": 3000
  },
  "originInfo": {
    "coordinates": { "latitude": 41.6938026, "longitude": 44.8015168 },
    "address": "Tbilisi, Georgia",
    "placeId": "ChIJa2JP5tcMREARo25X4u2E0GE"
  },
  "destinationInfo": {
    "coordinates": { "latitude": 41.6460978, "longitude": 41.64049 },
    "address": "Batumi, Georgia",
    "placeId": "ChIJIdKiTjCGZ0ARZ6ku4alTMHo"
  },
  "geminiPlan": {
    "itinerary": [
      {
        "day": 1,
        "categories": [
          {
            "category": "museum",
            "options": [
              {
                "placeId": "ChIJb36xY_EMREARu4c5ejmc_hs",
                "name": "Castle in Old Town",
                "coordinates": { "latitude": 41.6891795, "longitude": 44.8036152 },
                "address": "3 Betlemi Rise, Tbilisi",
                "category": { "type": "museum", "keyword": null },
                "summary": "Short description about this place",
                "openingHours": [
                  {
                    "open": { "day": 0, "time": "0800" },
                    "close": { "day": 0, "time": "2200" }
                  }
                ],
                "phone": "+995 555 30 10 60",
                "website": "http://www.castle.ge/",
                "url": "https://maps.google.com/?cid=2017221453786220475",
                "rating": 4.4,
                "types": ["museum", "tourist_attraction"],
                "photo": "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=..."
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 📘 Place Object Structure (`option`)

| Field          | Type     | Description                                                     |
| -------------- | -------- | --------------------------------------------------------------- |
| `placeId`      | string   | Google Place ID                                                 |
| `name`         | string   | Place name                                                      |
| `coordinates`  | object   | `{ latitude, longitude }`                                       |
| `address`      | string   | Full formatted address                                          |
| `category`     | object   | `{ type, keyword }`                                             |
| `summary`      | string   | Short description                                               |
| `openingHours` | array    | Opening hours (periods). Day: `0=Sun ... 6=Sat`, Time: `"HHMM"` |
| `phone`        | string   | International phone number                                      |
| `website`      | string   | Website URL                                                     |
| `url`          | string   | Google Maps URL                                                 |
| `rating`       | number   | Average rating (0–5)                                            |
| `types`        | string[] | Place types                                                     |
| `photo`        | string   | First photo URL                                                 |

---

## 📍 Endpoint

```
POST /api/tripPath
```

Purpose: This endpoint builds the final trip path including the ordered list of waypoints and an overview encoded polyline. It is intended for clients that already have a set of planned stops (waypoints) and want a consolidated route that connects them in order. The endpoint returns a compact `finalTrip` object with `origin`, `destination`, `waypoints[]` and `overviewPolyline` suitable for rendering on a map.

---

## 📥 Request Body

**Content-Type:** `application/json`

```json
{
  "origin": {
    "latitude": 41.6938026,
    "longitude": 44.8015168
  },
  "destination": {
    "latitude": 41.6460978,
    "longitude": 41.64049
  },
  "waypoints": [
    { "latitude": 41.6891795, "longitude": 44.8036152 },
    { "latitude": 41.705254, "longitude": 44.8007886 },
    { "latitude": 41.8883858, "longitude": 44.7075655 },
    { "latitude": 41.8797722, "longitude": 44.7216991 },
    { "latitude": 41.9894518, "longitude": 44.1122676 },
    { "latitude": 42.0932766, "longitude": 43.4228238 },
    { "latitude": 42.1003064, "longitude": 43.0585155 },
    { "latitude": 42.1139902, "longitude": 43.0311821 },
    { "latitude": 41.8180646, "longitude": 41.7745763 }
  ]
}
```

### Fields

| Field         | Type   | Required | Description                                       |
| ------------- | ------ | -------- | ------------------------------------------------- |
| `origin`      | object | ✅       | Starting coordinates `{ latitude, longitude }`    |
| `destination` | object | ✅       | Destination coordinates `{ latitude, longitude }` |
| `waypoints`   | array  | ✅       | Intermediate stops as an array of coordinates     |

---

## 📤 Response Body

**Content-Type:** `application/json`

```jsonc
{
  "finalTrip": {
    "origin": {
      "latitude": 41.6938026,
      "longitude": 44.8015168
    },
    "destination": {
      "latitude": 41.6460978,
      "longitude": 41.64049
    },
    "waypoints": [
      { "latitude": 41.6891795, "longitude": 44.8036152 },
      { "latitude": 41.705254, "longitude": 44.8007886 },
      { "latitude": 41.8883858, "longitude": 44.7075655 },
      { "latitude": 41.8797722, "longitude": 44.7216991 },
      { "latitude": 41.9894518, "longitude": 44.1122676 },
      { "latitude": 42.0932766, "longitude": 43.4228238 },
      { "latitude": 42.1003064, "longitude": 43.0585155 },
      { "latitude": 42.1139902, "longitude": 43.0311821 },
      { "latitude": 41.8180646, "longitude": 41.7745763 }
    ],
    "overviewPolyline": "_in}FahmpGqGcDxIzEjV..."
  }
}
```

---

## 📘 Notes

- The `overviewPolyline` field is an [encoded polyline](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) that represents the full route path.
- You can decode it on the client side to display the path on a map (e.g. using `@mapbox/polyline` for JavaScript).

---
