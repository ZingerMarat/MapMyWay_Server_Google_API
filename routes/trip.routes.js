import { Router } from "express"
import { planTripController } from "../controllers/trip.controller.js"
import { getFinalTripController } from "../controllers/getFinalTrip.controller.js"

const router = Router()

router.post("/planTrip", planTripController)
router.post("/getFinalTrip", getFinalTripController)

export default router
