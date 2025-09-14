import { Router } from "express"
import { geocode } from "../controllers/geocode.controller.js"

const router = Router()

// GET /api/geocode?address=Tbilisi
router.get("/", geocode)

export default router
