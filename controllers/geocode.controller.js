import { geocodeAddress } from "../services/geocoding.service.js"

export const geocode = async (req, res) => {
  try {
    const { address } = req.query
    if (!address) {
      return res.status(400).json({ error: "address is required" })
    }

    const coords = await geocodeAddress(address)
    res.json({ address, coords })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
