# Simple Gemini AI Integration

## Overview

Minimal API for preparing trip data for Gemini AI. Only includes essential data: places (ID, name, coordinates), start/end points, and days.

---

## API Endpoint

### Prepare Minimal Data for Gemini

**Endpoint:** `POST /api/gemini/prepare`

**Description:** Prepares minimal trip data for Gemini AI with only essential information.

**Request:**
```bash
POST /api/gemini/prepare
Content-Type: application/json

{
  "origin": "Tbilisi, Georgia",
  "destination": "Batumi, Georgia",
  "mode": "driving",
  "preferences": {
    "activities": ["museum", "restaurant"],
    "food": ["georgian"]
  },
  "radius": 3000,
  "days": 3
}
```

**Response:**
```json
{
  "tripId": "trip_1703123456789",
  "data": {
    "days": 3,
    "startPoint": {
      "name": "Tbilisi, Georgia",
      "coordinates": {
        "latitude": 41.7151,
        "longitude": 44.8271
      }
    },
    "endPoint": {
      "name": "Batumi, Georgia",
      "coordinates": {
        "latitude": 41.6168,
        "longitude": 41.6367
      }
    },
    "places": [
      {
        "id": "ChIJ2VhMz4MZ6kAR9Q5VBWrOKSk",
        "name": "National Museum of Georgia",
        "coordinates": {
          "latitude": 41.7200,
          "longitude": 44.8300
        }
      },
      {
        "id": "ChIJ...",
        "name": "Georgian Restaurant",
        "coordinates": {
          "latitude": 41.7200,
          "longitude": 44.8300
        }
      }
    ]
  },
  "prompt": "Create a 3-day trip itinerary from Tbilisi, Georgia to Batumi, Georgia.\n\nSTART POINT: Tbilisi, Georgia\nCoordinates: 41.7151, 44.8271\n\nEND POINT: Batumi, Georgia\nCoordinates: 41.6168, 41.6367\n\nAVAILABLE PLACES:\nNational Museum of Georgia (ID: ChIJ2VhMz4MZ6kAR9Q5VBWrOKSk) - Coordinates: 41.7200, 44.8300\nGeorgian Restaurant (ID: ChIJ...) - Coordinates: 41.7200, 44.8300\n\nPlease create a detailed day-by-day itinerary...",
  "validation": {
    "totalPlaces": 2,
    "warnings": []
  }
}
```

---

## Data Structure

### Minimal Data Object
```json
{
  "days": 3,
  "startPoint": {
    "name": "Tbilisi, Georgia",
    "coordinates": {
      "latitude": 41.7151,
      "longitude": 44.8271
    }
  },
  "endPoint": {
    "name": "Batumi, Georgia", 
    "coordinates": {
      "latitude": 41.6168,
      "longitude": 41.6367
    }
  },
  "places": [
    {
      "id": "place_id",
      "name": "Place Name",
      "coordinates": {
        "latitude": 41.7200,
        "longitude": 44.8300
      }
    }
  ]
}
```

### What's Included
- **Days**: Number of days for the trip
- **Start Point**: Name and coordinates of origin
- **End Point**: Name and coordinates of destination  
- **Places**: Array of places with only:
  - `id`: Google Place ID
  - `name`: Place name
  - `coordinates`: Latitude and longitude

### What's Excluded
- Route details (distance, duration, polyline)
- Place ratings, prices, hours
- Place categories and types
- User preferences
- Additional metadata

---

## Usage Example

```javascript
// Prepare data for Gemini AI
const response = await fetch('/api/gemini/prepare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin: 'Tbilisi, Georgia',
    destination: 'Batumi, Georgia',
    days: 3,
    preferences: {
      activities: ['museum', 'restaurant'],
      food: ['georgian']
    }
  })
})

const data = await response.json()

// Send prompt to Gemini AI
const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GEMINI_API_KEY}`
  },
  body: JSON.stringify({
    contents: [{
      parts: [{
        text: data.prompt
      }]
    }]
  })
})
```

---

## Error Codes

- `MISSING_LOCATIONS` - Origin/destination parameters are missing
- `INVALID_DAYS` - Days parameter must be between 1 and 30
- `INVALID_TRIP_DATA` - Trip data validation failed
- `GEMINI_PREPARATION_ERROR` - Error preparing data for Gemini

---

## Features

- **Minimal Data**: Only essential information for AI
- **Clean Structure**: Simple, flat data structure
- **Ready Prompt**: Pre-formatted prompt for Gemini AI
- **Validation**: Basic data validation
- **Fast Processing**: Minimal data processing overhead

