import { Router } from "express"
import { getPlacesOnRoute } from "../controllers/places.controller.js"

const router = Router()

router.post("/onroute", getPlacesOnRoute)

export default router
