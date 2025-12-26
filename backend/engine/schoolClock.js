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
import cron from "node-cron"
import SchoolSession from "../models/SchoolSession.js"

export default function startSchoolClock(io) {

  cron.schedule("*/10 * * * * *", async () => {

    const session = await SchoolSession.findOne({ sessionActive: true })
    if (!session) {
      console.log("No active session found")
      return
    }

    const now = new Date()
    const elapsed =
      (now.getTime() - session.lastPhaseChange.getTime()) / 1000

    console.log("PHASE:", session.currentPhase, 
                "DAY:", session.currentDay,
                "ELAPSED:", elapsed)

    if (session.currentPhase === "school" &&
        elapsed >= session.dayDurationSeconds) {

        console.log("→ Switching SCHOOL → NIGHTGAP")

        session.currentPhase = "nightgap"
        session.currentDay += 1
        session.lastPhaseChange = now
        await session.save()
    }

    else if (session.currentPhase === "nightgap" &&
             elapsed >= session.nightGapDurationSeconds) {

        console.log("→ Switching NIGHTGAP → OFFDAY or SCHOOL")

        const day = now.getDay()

        if (day === 6) session.currentPhase = "offday"
        else session.currentPhase = "school"

        session.lastPhaseChange = now
        await session.save()
    }

    else if (session.currentPhase === "offday" &&
             elapsed >= session.offDayDurationSeconds) {

        console.log("→ Switching OFFDAY")

        const day = now.getDay()

        if (day === 0) session.currentPhase = "school"
        else session.currentPhase = "offday"

        session.lastPhaseChange = now
        await session.save()
    }
  })
}


