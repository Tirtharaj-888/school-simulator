import startSchoolClock from "./engine/schoolClock.js"
import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import http from "http"
import {Server} from "socket.io"

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {cors: {origin: "*"}})

// mongoose.connect(process.env.MONGO_URI).
// then(() => console.log("MongoDB Brain Connected")).
// catch(err => console.log(err)) 
// //this part results in MongooseServerSelectionError because of trying to connect through IPv6 SRV resolution, which often fails on Windows/Indian ISPs

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4
})
.then(() => console.log("MongoDB Brain Connected"))
.catch(err => console.log("MongoDB ERROR:", err.message))

io.on("connection", socket => 
{console.log("Student connected:", socket.id)})

startSchoolClock(io)
server.listen(5000, () => console.log("School engine running on 5000"))
