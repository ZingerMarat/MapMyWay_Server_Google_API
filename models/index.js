/**
 * Data models for MapMyWay Server API
 * Provides typed data transfer between services
 */

/**
 * Coordinates of a point on the map
 * @typedef {Object} Coordinates
 * @property {number} latitude - Latitude
 * @property {number} longitude - Longitude
 */

/**
 * Geocoded address
 * @typedef {Object} GeocodedAddress
 * @property {string} originalAddress - Original address
 * @property {Coordinates} coordinates - Coordinates
 * @property {string} formattedAddress - Formatted address from Google
 * @property {string} placeId - Google Place ID
 */

/**
 * Distance information
 * @typedef {Object} DistanceInfo
 * @property {string} text - Human-readable text
 * @property {number} value - Value in meters
 */

/**
 * Duration information
 * @typedef {Object} DurationInfo
 * @property {string} text - Human-readable text
 * @property {number} value - Value in seconds
 */

/**
 * Route between two points
 * @typedef {Object} Route
 * @property {DistanceInfo} distance - Distance information
 * @property {DurationInfo} duration - Duration information
 * @property {string} polyline - Encoded route
 * @property {GeocodedAddress} startLocation - Start point
 * @property {GeocodedAddress} endLocation - End point
 * @property {string} travelMode - Travel mode
 */

/**
 * Place category
 * @typedef {Object} PlaceCategory
 * @property {string} type - Place type (Google Places type)
 * @property {string} [keyword] - Additional keyword
 */

/**
 * Place information
 * @typedef {Object} Place
 * @property {string} placeId - Google Place ID
 * @property {string} name - Place name
 * @property {Coordinates} coordinates - Coordinates
 * @property {string} address - Address
 * @property {number} [rating] - Rating (0-5)
 * @property {number} [priceLevel] - Price level (0-4)
 * @property {Object} [openingHours] - Opening hours
 * @property {string[]} types - Place types
 * @property {PlaceCategory} category - Search category
 */

/**
 * User preferences
 * @typedef {Object} UserPreferences
 * @property {string[]} [activities] - Activity preferences
 * @property {string[]} [food] - Food preferences
 */

/**
 * Trip plan
 * @typedef {Object} TripPlan
 * @property {string} origin - Start point
 * @property {string} destination - End point
 * @property {GeocodedAddress} startLocation - Geocoded start point
 * @property {GeocodedAddress} endLocation - Geocoded end point
 * @property {Route} route - Route
 * @property {Place[]} places - Places along the route
 * @property {UserPreferences} preferences - User preferences
 * @property {number} searchRadius - Search radius in meters
 */

/**
 * Places search result
 * @typedef {Object} PlacesSearchResult
 * @property {number} totalCheckpoints - Number of checked points
 * @property {Place[]} places - Found places
 * @property {PlaceCategory[]} searchedCategories - Searched categories
 */

/**
 * Creates a coordinates object
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Coordinates}
 */
export const createCoordinates = (latitude, longitude) => ({
  latitude,
  longitude
})

/**
 * Creates a geocoded address object
 * @param {string} originalAddress - Original address
 * @param {Coordinates} coordinates - Coordinates
 * @param {string} [formattedAddress] - Formatted address
 * @param {string} [placeId] - Google Place ID
 * @returns {GeocodedAddress}
 */
export const createGeocodedAddress = (originalAddress, coordinates, formattedAddress = null, placeId = null) => ({
  originalAddress,
  coordinates,
  formattedAddress,
  placeId
})

/**
 * Creates a distance information object
 * @param {string} text - Text representation
 * @param {number} value - Value in meters
 * @returns {DistanceInfo}
 */
export const createDistanceInfo = (text, value) => ({
  text,
  value
})

/**
 * Creates a duration information object
 * @param {string} text - Text representation
 * @param {number} value - Value in seconds
 * @returns {DurationInfo}
 */
export const createDurationInfo = (text, value) => ({
  text,
  value
})

/**
 * Creates a route object
 * @param {DistanceInfo} distance - Distance information
 * @param {DurationInfo} duration - Duration information
 * @param {string} polyline - Encoded route
 * @param {GeocodedAddress} startLocation - Start point
 * @param {GeocodedAddress} endLocation - End point
 * @param {string} travelMode - Travel mode
 * @returns {Route}
 */
export const createRoute = (distance, duration, polyline, startLocation, endLocation, travelMode) => ({
  distance,
  duration,
  polyline,
  startLocation,
  endLocation,
  travelMode
})

/**
 * Creates a place category object
 * @param {string} type - Place type
 * @param {string} [keyword] - Additional keyword
 * @returns {PlaceCategory}
 */
export const createPlaceCategory = (type, keyword = null) => ({
  type,
  keyword
})

/**
 * Creates a place object
 * @param {string} placeId - Google Place ID
 * @param {string} name - Name
 * @param {Coordinates} coordinates - Coordinates
 * @param {string} address - Address
 * @param {PlaceCategory} category - Search category
 * @param {Object} [additionalInfo] - Additional information
 * @returns {Place}
 */
export const createPlace = (placeId, name, coordinates, address, category, additionalInfo = {}) => ({
  placeId,
  name,
  coordinates,
  address,
  category,
  ...additionalInfo
})

/**
 * Creates a user preferences object
 * @param {Object} preferences - Preferences
 * @returns {UserPreferences}
 */
export const createUserPreferences = (preferences = {}) => ({
  activities: preferences.activities || [],
  food: preferences.food || []
})

/**
 * Creates a trip plan object
 * @param {string} origin - Start point
 * @param {string} destination - End point
 * @param {GeocodedAddress} startLocation - Geocoded start point
 * @param {GeocodedAddress} endLocation - Geocoded end point
 * @param {Route} route - Route
 * @param {Place[]} places - Places along the route
 * @param {UserPreferences} preferences - User preferences
 * @param {number} searchRadius - Search radius
 * @returns {TripPlan}
 */
export const createTripPlan = (origin, destination, startLocation, endLocation, route, places, preferences, searchRadius) => ({
  origin,
  destination,
  startLocation,
  endLocation,
  route,
  places,
  preferences,
  searchRadius
})

/**
 * Creates a places search result object
 * @param {number} totalCheckpoints - Number of checked points
 * @param {Place[]} places - Found places
 * @param {PlaceCategory[]} searchedCategories - Searched categories
 * @returns {PlacesSearchResult}
 */
export const createPlacesSearchResult = (totalCheckpoints, places, searchedCategories) => ({
  totalCheckpoints,
  places,
  searchedCategories
})

/**
 * Converts coordinates to string for API
 * @param {Coordinates} coordinates - Coordinates
 * @returns {string} String in "lat,lng" format
 */
export const coordinatesToString = (coordinates) => 
  `${coordinates.latitude},${coordinates.longitude}`

/**
 * Converts coordinate string to object
 * @param {string} coordinatesString - String in "lat,lng" format
 * @returns {Coordinates} Coordinates object
 */
export const stringToCoordinates = (coordinatesString) => {
  const [latitude, longitude] = coordinatesString.split(',').map(Number)
  return createCoordinates(latitude, longitude)
}
