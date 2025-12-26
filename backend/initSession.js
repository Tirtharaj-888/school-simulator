import mongoose from "mongoose"
import dotenv from "dotenv"
import SchoolSession from "./models/SchoolSession.js"

dotenv.config()

await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})

await SchoolSession.deleteMany({})

await SchoolSession.create({
  sessionStartTime: new Date(),
  dayDurationSeconds: 120,
  nightGapDurationSeconds: 10,
  offDayDurationSeconds: 30,
  currentDay: 1,
  currentPhase: "school",
  lastPhaseChange: new Date(),
  sessionActive: true
})

console.log("Fresh SchoolSession created.")
process.exit()
