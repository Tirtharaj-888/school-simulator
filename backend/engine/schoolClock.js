// import cron from "node-cron"
// import SchoolSession from "../models/SchoolSession.js"

// export default function startSchoolClock(io) {

//   cron.schedule("*/10 * * * * *", async () => {
//     // console.log("Clock tick:", new Date().toLocaleTimeString())
//     const session = await SchoolSession.findOne({ sessionActive: true })
//     if (!session) return

//     const now = new Date()
//     const elapsed =
//       (now.getTime() - session.lastPhaseChange.getTime()) / 1000

//     // SCHOOL → NIGHT GAP
//     if (session.currentPhase === "school" &&
//         elapsed >= session.dayDurationSeconds) {

//         session.currentPhase = "nightgap"
//         session.lastPhaseChange = now
//         session.currentDay += 1   // increment only when school ends
//         await session.save()

//         io.emit("school-update", { phase: "nightgap", day: session.currentDay })
//     }

//     // NIGHT GAP → OFFDAY or SCHOOL
//     else if (session.currentPhase === "nightgap" &&
//              elapsed >= session.nightGapDurationSeconds) {

//         const day = now.getDay() // 6=Sat, 0=Sun

//         if (day === 6) session.currentPhase = "offday"
//         else session.currentPhase = "school"

//         session.lastPhaseChange = now
//         await session.save()

//         io.emit("school-update", { phase: session.currentPhase, day: session.currentDay })
//     }

//     // OFFDAY → OFFDAY or SCHOOL
//     else if (session.currentPhase === "offday" &&
//              elapsed >= session.offDayDurationSeconds) {

//         const day = now.getDay()

//         if (day === 0) session.currentPhase = "school" // Sunday → Monday
//         else session.currentPhase = "offday"           // Saturday → Sunday

//         session.lastPhaseChange = now
//         await session.save()

//         io.emit("school-update", { phase: session.currentPhase, day: session.currentDay })
//     }
//   })
// }

// Diagnostic Code
// import cron from "node-cron"
// import SchoolSession from "../models/SchoolSession.js"

// export default function startSchoolClock(io) {

//   cron.schedule("*/10 * * * * *", async () => {

//     const session = await SchoolSession.findOne({ sessionActive: true })
//     if (!session) {
//       console.log("No active session found")
//       return
//     }

//     const now = new Date()
//     const elapsed =
//       (now.getTime() - session.lastPhaseChange.getTime()) / 1000

//     console.log("PHASE:", session.currentPhase, 
//                 "DAY:", session.currentDay,
//                 "ELAPSED:", elapsed)

//     if (session.currentPhase === "school" &&
//         elapsed >= session.dayDurationSeconds) {

//         console.log("→ Switching SCHOOL → NIGHTGAP")

//         session.currentPhase = "nightgap"
//         session.currentDay += 1
//         session.lastPhaseChange = now
//         await session.save()
//     }

//     else if (session.currentPhase === "nightgap" &&
//              elapsed >= session.nightGapDurationSeconds) {

//         console.log("→ Switching NIGHTGAP → OFFDAY or SCHOOL")

//         const day = now.getDay()

//         if (day === 6) session.currentPhase = "offday"
//         else session.currentPhase = "school"

//         session.lastPhaseChange = now
//         await session.save()
//     }

//     else if (session.currentPhase === "offday" &&
//              elapsed >= session.offDayDurationSeconds) {

//         console.log("→ Switching OFFDAY")

//         const day = now.getDay()

//         if (day === 0) session.currentPhase = "school"
//         else session.currentPhase = "offday"

//         session.lastPhaseChange = now
//         await session.save()
//     }
//   })
// }

//v2 - fix goal - unexpected nightgaps, sometimes 1, sometimes 2, never accelerate earth calendar
// import cron from "node-cron"
// import SchoolSession from "../models/SchoolSession.js"

// export default function startSchoolClock(io) {

//   cron.schedule("*/10 * * * * *", async () => {

//     const session = await SchoolSession.findOne({ sessionActive: true })
//     if (!session) return

//     const now = new Date()
//     const elapsed =
//       (now.getTime() - session.lastPhaseChange.getTime()) / 1000

//     const simulatedWeekday = (session.currentDay - 1) % 7
//     // 0-4 : Mon-Fri
//     // 5   : Sat
//     // 6   : Sun

//     console.log("PHASE:", session.currentPhase,
//                 "DAY:", session.currentDay,
//                 "ELAPSED:", elapsed,
//                 "SIM_DAY:", simulatedWeekday)

//     // SCHOOL → NIGHTGAP
//     if (session.currentPhase === "school" &&
//         elapsed >= session.dayDurationSeconds) {

//         session.currentPhase = "nightgap"
//         session.currentDay += 1
//         session.lastPhaseChange = now
//         await session.save()

//         console.log("→ SCHOOL → NIGHTGAP")
//         return
//     }

//     // NIGHTGAP → OFFDAY or SCHOOL
//     if (session.currentPhase === "nightgap" &&
//         elapsed >= session.nightGapDurationSeconds) {

//         if (simulatedWeekday === 5 || simulatedWeekday === 6)
//             session.currentPhase = "offday"
//         else
//             session.currentPhase = "school"

//         session.lastPhaseChange = now
//         await session.save()

//         console.log("→ NIGHTGAP →", session.currentPhase.toUpperCase())
//         return
//     }

//     // OFFDAY → OFFDAY or SCHOOL
//     if (session.currentPhase === "offday" &&
//         elapsed >= session.offDayDurationSeconds) {

//         if (simulatedWeekday === 6)
//             session.currentPhase = "school"
//         else
//             session.currentPhase = "offday"

//         session.lastPhaseChange = now
//         await session.save()

//         console.log("→ OFFDAY →", session.currentPhase.toUpperCase())
//     }
//   })
// } // - waste code

//v3 - waste code
//v4 - waste code
//v5 - waste code
//v6 - final stable code, with 120s school + 10s nightgap, but no weekend schooloff x2
import cron from "node-cron"
import SchoolSession from "../models/SchoolSession.js"

export default function startSchoolClock() {

  cron.schedule("* * * * * *", async () => {

    const s = await SchoolSession.findOne({ sessionActive: true })
    if (!s) return

    const now = new Date()
    const elapsed = (now - s.lastPhaseChange) / 1000

    console.log(`PHASE:${s.currentPhase} DAY:${s.currentDay} ELAPSED:${elapsed.toFixed(2)}`)

    // ---------------- SCHOOL → NIGHTGAP ----------------
    if (s.currentPhase === "school" && elapsed >= s.dayDurationSeconds) {

      const updated = await SchoolSession.findOneAndUpdate(
        {
          _id: s._id,
          currentPhase: "school",
          lastPhaseChange: s.lastPhaseChange
        },
        {
          $set: {
            currentPhase: "nightgap",
            lastPhaseChange: now
          }
        },
        { new: true }
      )

      if (updated) console.log("→ SCHOOL → NIGHTGAP")
      return
    }

    // ---------------- NIGHTGAP → SCHOOL ----------------
    if (s.currentPhase === "nightgap" && elapsed >= s.nightGapDurationSeconds) {

      const updated = await SchoolSession.findOneAndUpdate(
        {
          _id: s._id,
          currentPhase: "nightgap",
          lastPhaseChange: s.lastPhaseChange
        },
        {
          $set: {
            currentPhase: "school",
            lastPhaseChange: now
          },
          $inc: { currentDay: 1 }
        },
        { new: true }
      )

      if (updated) console.log("→ NIGHTGAP → SCHOOL")
      return
    }

  })
}
