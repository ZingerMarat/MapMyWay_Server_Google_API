import axios from "axios"

export const getFinalTrip = async (origin, destination, waypoints) => {
  const url = new URL("https://maps.googleapis.com/maps/api/directions/json")

  url.searchParams.set("origin", `${origin.latitude},${origin.longitude}`)
  url.searchParams.set("destination", `${destination.latitude},${destination.longitude}`)

  if (waypoints.length > 0) {
    const waypointsStr = waypoints.map((p) => `${p.latitude},${p.longitude}`).join("|")

    url.searchParams.set("waypoints", waypointsStr)
  }

  url.searchParams.set("mode", "driving")
  url.searchParams.set("key", process.env.GOOGLE_API_KEY)

  try {
    const response = await axios.get(url.toString())
    const data = response.data

    if (data.status !== "OK") {
      throw new Error(`Google Directions API error: ${data.status}`)
    }

    return {
      origin,
      destination,
      waypoints,
      overviewPolyline: data.routes[0].overview_polyline.points,
    }
  } catch (error) {
    console.error("❌ Error calling Google Directions API:", error.message)
    throw error
  }
}
