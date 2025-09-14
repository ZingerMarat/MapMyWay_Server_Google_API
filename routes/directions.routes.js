import { Router } from "express"
import { getDirections } from "../controllers/directions.controller.js"

const router = Router()

router.post("/", getDirections)

export default router
