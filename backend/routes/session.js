import express from "express"
import SchoolSession from "../models/SchoolSession.js"

const router = express.Router()

router.get("/status", async (req, res) => {
  const session = await SchoolSession.findOne({ sessionActive: true })
  if (!session) return res.status(404).json({ error: "No active session" })

  res.json({
    phase: session.currentPhase,
    day: session.currentDay
  })
})

export default router