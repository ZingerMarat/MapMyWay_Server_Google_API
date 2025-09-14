import { Router } from "express"
import { planTripController } from "../controllers/trip.controller.js"

const router = Router()

router.post("/plan", planTripController)

export default router
