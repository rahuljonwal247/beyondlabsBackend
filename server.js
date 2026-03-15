require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const connectDB = require("./db");
const taskRoutes = require("./routes/tasks");
const app  = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend + MongoDB running 🚀" });
});

app.use("/api/tasks", taskRoutes);

// 👇 Add your routes here


app.listen(PORT, () => console.log(`✅ Backend → http://localhost:${PORT}`));