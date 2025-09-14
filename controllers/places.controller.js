import { searchPlacesOnRoute } from "../services/places.service.js"
import { createPlaceCategory } from "../models/index.js"

/**
 * Controller for searching places along a route
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
export const getPlacesOnRoute = async (req, res) => {
  try {
    const { polyline, categories, radius } = req.body

    // Input validation
    if (!polyline) {
      return res.status(400).json({ 
        error: "Polyline parameter is required",
        code: "MISSING_POLYLINE"
      })
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ 
        error: "Categories parameter must be a non-empty array",
        code: "MISSING_CATEGORIES"
      })
    }

    // Convert categories to typed objects
    const placeCategories = categories.map(cat => {
      if (typeof cat === 'string') {
        return createPlaceCategory(cat)
      }
      return createPlaceCategory(cat.type, cat.keyword)
    })

    // Search places along the route
    const searchResult = await searchPlacesOnRoute(polyline, placeCategories, radius || 3000)

    // Form response with clear variable names
    const response = {
      searchInfo: {
        totalCheckpoints: searchResult.totalCheckpoints,
        searchedCategories: searchResult.searchedCategories,
        searchRadius: radius || 3000
      },
      places: searchResult.places.map(place => ({
        placeId: place.placeId,
        name: place.name,
        coordinates: {
          latitude: place.coordinates.latitude,
          longitude: place.coordinates.longitude
        },
        address: place.address,
        category: {
          type: place.category.type,
          keyword: place.category.keyword
        },
        rating: place.rating,
        priceLevel: place.priceLevel,
        openingHours: place.openingHours,
        types: place.types
      })),
      summary: {
        totalPlaces: searchResult.places.length,
        categoriesFound: [...new Set(searchResult.places.map(p => p.category.type))]
      }
    }

    res.json(response)
  } catch (err) {
    console.error("❌ Places search error:", err)
    res.status(500).json({ 
      error: err.message,
      code: "PLACES_SEARCH_ERROR"
    })
  }
}
