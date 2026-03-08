require("dotenv").config()

const express = require("express")
const http = require("http")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const path = require("path")
const cron = require("node-cron")

const connectDB = require("./config/db")
const socketInit = require("./socket")
const Event = require("./models/Event")

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const clubRoutes = require("./routes/clubs")
const eventRoutes = require("./routes/events")
const noticeRoutes = require("./routes/notices")
const messageRoutes = require("./routes/messages")
const projectRoutes = require("./routes/projects")
const lostFoundRoutes = require("./routes/lostfound")
const adminRoutes = require("./routes/admin")

const PORT = process.env.PORT || 5000

const app = express()
const server = http.createServer(app)

connectDB(process.env.MONGO_URI)

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || "*" }))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(rateLimit({ windowMs: 60000, max: 200 }))

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/clubs", clubRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/notices", noticeRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/lost-found", lostFoundRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/upload", require("./routes/upload"))

app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() })
})

const io = socketInit(server)
app.set("io", io)

cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date()
    const result = await Event.deleteMany({ startsAt: { $lt: now } })
    if (result.deletedCount > 0) {
      console.log(`Deleted ${result.deletedCount} expired events`)
    }
  } catch (err) {
    console.error("Cron error:", err.message)
  }
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
