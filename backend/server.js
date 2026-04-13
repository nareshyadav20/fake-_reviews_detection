// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios"); // To call the Python API

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";

// ===== MongoDB Connection =====
console.log("Attempting to connect to MongoDB Atlas...");
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout to fail fast
})
  .then(() => console.log("✅ SUCCESS: MongoDB connected to Atlas!"))
  .catch(err => {
    console.error("❌ ERROR: Failed to connect to MongoDB Atlas.");
    console.error("Please check your MONGO_URI in .env and ensure your IP is whitelisted in MongoDB Atlas.");
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

// ===== Middleware to verify JWT =====
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Failed to authenticate token" });
    req.user = decoded; // username is inside decoded
    next();
  });
}

// ===== Signup Route =====
app.post("/signup", async (req, res) => {
  try {
    const { name, username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Save user
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

// ===== Predict Review Route =====
app.post("/predict", verifyToken, async (req, res) => {
  const { review } = req.body;

  try {
    const response = await axios.post("http://localhost:6000/predict", { review });

    console.log("ML Service Response:", response.data);

    res.json({
      prediction: response.data.prediction,
      confidence: response.data.confidence,
      conclusion: response.data.conclusion,
      reasons: response.data.reasons,
      is_generic: response.data.is_generic
    });

  } catch (err) {
    console.error("Error calling ML API:", err.message);

    res.status(500).json({
      prediction: "Error detecting review",
      confidence: 0,
      reasons: [],
      is_generic: false
    });
  }
});

// ===== Save Review Route =====
app.post("/save", verifyToken, async (req, res) => {
  try {
    const { review, prediction, confidence, reasons, conclusion, is_generic } = req.body;
    const newReview = new Review({
      username: req.user.username,
      review,
      prediction,
      confidence,
      reasons,
      conclusion,
      is_generic
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

    res.json({
      history,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalCount: total
    });
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

// ===== Test Route =====
app.get("/", (req, res) => {
  res.send("Backend server running with MongoDB!");
});

// ===== Start Server =====
const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));