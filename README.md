# 🗺 Trip Planning API

An API for automatically planning travel routes between two locations based on user preferences.  
It uses **Google Directions API**, **Google Places API**, and **Gemini** to generate a multi-day itinerary.

---

## 📍 Endpoint

```
POST /api/trip/plantrip
```

---

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
