// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { spawn } = require("child_process");
const path = require("path");

const app = express();

// ===== CORS — allow local and production frontends =====
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://fake-review-detector.vercel.app",
  "https://fake-reviews-detection-zeta.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Clean the origin for comparison (remove trailing slash)
      const cleanOrigin = origin.replace(/\/$/, "");

      const isAllowed = allowedOrigins.some((allowed) => {
        const cleanAllowed = allowed.replace(/\/$/, "");
        return cleanOrigin === cleanAllowed;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";
const ML_PORT = process.env.ML_PORT || 6000;

// ===== Spawn Python Flask ML Service =====
function startMLService() {
  const scriptPath = path.join(__dirname, "predict_api.py");

  // Use 'py' launcher on Windows, 'python3' on Linux/Render
  const pythonCmd = process.platform === "win32" ? "py" : "python3";

  const ml = spawn(pythonCmd, [scriptPath], {
    env: { ...process.env, ML_PORT: String(ML_PORT) },
    stdio: "inherit",
  });

  ml.on("error", (err) => {
    console.error("❌ Failed to start ML service:", err.message);
  });

  ml.on("close", (code) => {
    if (code !== 0) {
      console.warn(`⚠️  ML service exited with code ${code}. Restarting in 3s...`);
      setTimeout(startMLService, 3000);
    }
  });

  console.log(`🐍 ML service started (PID: ${ml.pid}) on port ${ML_PORT}`);
  return ml;
}

startMLService();

// ===== MongoDB Connection =====
console.log("Attempting to connect to MongoDB Atlas...");
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("✅ SUCCESS: MongoDB connected to Atlas!"))
  .catch((err) => {
    console.error("❌ ERROR: Failed to connect to MongoDB Atlas.");
    console.error("Details:", err.message);
  });

// ===== User Schema =====
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// ===== Review Schema =====
const reviewSchema = new mongoose.Schema({
  username: { type: String, required: true },
  review: { type: String, required: true },
  prediction: { type: String, required: true },
  confidence: { type: Number, required: true },
  reasons: { type: [String] },
  conclusion: { type: String },
  is_generic: { type: Boolean },
  timestamp: { type: Date, default: Date.now },
});
const Review = mongoose.model("Review", reviewSchema);

// ===== JWT Middleware =====
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Failed to authenticate token" });
    req.user = decoded;
    next();
  });
}

// ===== Signup Route =====
app.post("/signup", async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, username, password: hashed });
    await newUser.save();
    res.json({ message: "Signup successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// ===== Login Route =====
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Login successful!", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ===== Predict Route (calls internal Flask service) =====
app.post("/predict", verifyToken, async (req, res) => {
  const { review } = req.body;
  try {
    // Wait up to 5 s for Flask to be ready on first cold start
    const response = await axios.post(
      `http://127.0.0.1:${ML_PORT}/predict`,
      { review },
      { timeout: 10000 }
    );
    console.log("ML Service Response:", response.data);
    res.json({
      prediction: response.data.prediction,
      confidence: response.data.confidence,
      conclusion: response.data.conclusion,
      reasons: response.data.reasons,
      is_generic: response.data.is_generic,
    });
  } catch (err) {
    console.error("Error calling ML API:", err.message);
    res.status(500).json({
      prediction: "Error detecting review",
      confidence: 0,
      reasons: [],
      is_generic: false,
    });
  }
});

// ===== Save Review Route =====
app.post("/save", verifyToken, async (req, res) => {
  try {
    const { review, prediction, confidence, reasons, conclusion, is_generic } = req.body;
    const newReview = new Review({
      username: req.user.username,
      review, prediction, confidence, reasons, conclusion, is_generic,
    });
    await newReview.save();
    res.json({ message: "Review saved successfully!" });
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).json({ message: "Failed to save review" });
  }
});

// ===== History Route =====
app.get("/history", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments({ username: req.user.username });
    const history = await Review.find({ username: req.user.username })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ history, totalPages: Math.ceil(total / limit), currentPage: page, totalCount: total });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

// ===== Analytics Route =====
app.get("/analytics", verifyToken, async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments({ username: req.user.username });
    const fakeCount = await Review.countDocuments({ username: req.user.username, prediction: "Likely Fake" });
    const genuineCount = totalReviews - fakeCount;
    res.json({ totalReviews, fakeCount, genuineCount });
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

// ===== Health Check =====
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Fake Review Detector backend running." });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));