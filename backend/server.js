// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios"); // To call the Python API

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "supersecretkey";

// ===== MongoDB Connection =====
mongoose.connect("mongodb://127.0.0.1:27017/fake_review_users")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// ===== User Schema =====
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

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

    console.log("ML Service Response:", response.data); // Debug logging

    res.json({
      prediction: response.data.prediction,
      confidence: response.data.confidence,
      conclusion: response.data.conclusion,   // ⭐ AI conclusion text
      reasons: response.data.reasons,         // ⭐ updated
      is_generic: response.data.is_generic    // ⭐ added
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

// ===== Test Route =====
app.get("/", (req, res) => {
  res.send("Backend server running!");
});

// ===== Start Server =====
const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));