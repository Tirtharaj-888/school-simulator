import mongoose from "mongoose"

const schoolSessionSchema = new mongoose.Schema({
  sessionStartTime: Date,

  dayDurationSeconds: Number,
  nightGapDurationSeconds: Number,
  offDayDurationSeconds: Number,

  currentDay: Number,
  currentPhase: {
    type: String,
    enum: ["school", "nightgap", "offday"]
  },

  lastPhaseChange: Date,
  sessionActive: Boolean
})

export default mongoose.model("SchoolSession", schoolSessionSchema)
