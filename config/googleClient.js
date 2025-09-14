import axios from "axios"

export const googleClient = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api",
  timeout: 5000,
})
