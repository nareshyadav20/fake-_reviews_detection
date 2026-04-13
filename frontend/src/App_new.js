import React, { useState } from "react";
import axios from "axios";
import { UserIcon, LockIcon, EmailIcon, ShieldLoginIcon, LoginDecorativeIcon, KeyIcon, EyeIcon, EyeOffIcon, ShoppingIcon } from "./components/LoginIcons";

function App() {

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [review, setReview] = useState("");
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [suspiciousWords, setSuspiciousWords] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Signup
  const signup = async () => {
    if (!name || !username || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/signup", {
        name, username, password
      });
      alert("Signup successful! Please login with your new account.");
      setIsLoginMode(true); // Switch to login mode after successful signup
    } catch (err) {
      alert("Signup failed: " + (err.response?.data?.message || err.message));
    }
  };

  // Login
  const login = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      await axios.post("http://localhost:5001/login", {
        username, password
      });

      alert("Login successful! Welcome back.");
      setToken("dummy-token"); // Set dummy token for demo

    } catch (err) {
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  // Logout
  const logout = () => {
    setToken("");
    setPrediction("");
    setReview("");
    setHistory([]);
  }

  // Detect Review
  const detectReview = async () => {

    if (!token) {
      alert("Please login first");
      return;
    }

    try {

      const res = await axios.post(
        "http://localhost:5001/predict",
        { review },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const pred = res.data.prediction;
      const conf = res.data.confidence;
      const words = res.data.suspicious_words || [];

      setPrediction(pred);
      setConfidence(conf);
      setSuspiciousWords(words);

      setHistory([...history, {
        review,
        prediction: pred,
        confidence: conf
      }]);

    } catch (err) {
      console.log(err);
    }

  };

  const isFake = prediction === "Fake";

  const fakeCount = history.filter(h => h.prediction === "Fake").length;
  const genuineCount = history.filter(h => h.prediction === "Genuine").length;

  const getExplanation = () => {

    if (isFake) {
      if (suspiciousWords.length > 0) {
        return `This review contains suspicious promotional words like ${suspiciousWords.join(", ")} which are commonly used in fake reviews.`;
      }
      return "This review looks overly promotional and may not represent real user experience.";
    }

    return "This review appears natural and describes a real user experience.";
  };

  return (

    <div style={{ fontFamily: "Arial", background: "#f5f7fb", minHeight: "100vh" }}>

      {/* HEADER */}

      {/* ===== Header ===== */}
      <header style={{
        background: "linear-gradient(135deg, #667eea 0%, #4ECDC4 100%)",
        color: "white",
        padding: "50px 20px",
        textAlign: "center",
        position: "relative",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.15)"
      }}>

        {/* Background Pattern */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "120px",
          opacity: "0.2"
        }}>
          <LoginDecorativeIcon />
        </div>

        {/* Title */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "15px",
          marginBottom: "10px"
        }}>
          <ShieldLoginIcon />
          <div>
            <h1 style={{
              margin: 0,
              fontSize: "42px",
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #4ECDC4 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
            }}>
              Fake Review Detector
            </h1>
            <p style={{
              margin: "5px 0 0",
              fontSize: "16px",
              opacity: 0.9,
              fontWeight: "500",
              textShadow: "0 2px 4px rgba(255,255,255,0.2)"
            }}>
              Advanced AI-Powered Analysis
            </p>
          </div>
        </div>

        {/* Logout Button */}
        {token && (
          <button
            onClick={logout}
            style={{
              position: "absolute",
              right: "20px",
              top: "20px",
              background: "#ffcc00",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer"
            }}>
            Logout
          </button>
        )}

      </header>

      {/* HERO SECTION */}
      {!token && (
        <section style={{
          background: "linear-gradient(135deg, #667eea 0%, #4ECDC4 100%)",
          color: "white",
          textAlign: "center",
          padding: "80px 20px"
        }}>
          <div style={{
            maxWidth: "700px",
            margin: "0 auto"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "30px"
            }}>
              <ShoppingIcon size={50} color="white" />
              <h2 style={{
                fontSize: "36px",
                fontWeight: "600",
                marginBottom: "25px",
                textShadow: "0 4px 12px rgba(0,0,0,0.3)"
              }}>
                Shopping Safety First
              </h2>
            </div>
            <h2 style={{
              fontSize: "28px",
              fontWeight: "600",
              marginBottom: "20px",
              textShadow: "0 4px 8px rgba(0,0,0,0.3)"
            }}>
              Detect Fake Reviews Instantly
            </h2>
            <p style={{
              fontSize: "18px",
              lineHeight: "1.6",
              opacity: 0.95,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <LockIcon size={20} color="white" />
                <span>Keep your online shopping safe by analyzing product reviews using AI.</span>
              </span>
              <br />
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldLoginIcon size={20} color="white" />
                <span>Protect yourself from deceptive reviews and make informed purchasing decisions.</span>
              </span>
            </p>
          </div>
        </section>)}

      <div style={{ display: "flex", justifyContent: "center", padding: token ? "60px 20px" : "20px" }}>

        <div style={{
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(30px)",
          padding: "70px",
          borderRadius: "35px",
          width: "100%",
          maxWidth: "600px",
          boxShadow: "0 30px 70px rgba(102, 126, 234, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.5)"
        }}>

          {/* LOGIN / SIGNUP */}

          {!token ? (

            <div>

              <h3 style={{
                fontSize: "32px",
                fontWeight: "600",
                marginBottom: "35px",
                color: "#333",
                textAlign: "center",
                textShadow: "0 3px 6px rgba(102, 126, 234, 0.15)"
              }}>
                {isLoginMode ? "Welcome Back" : "Create Account"}
              </h3>

              {/* Show name field only during signup */}
              {!isLoginMode && (
                <div style={{ marginBottom: "30px" }}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                    color: "#555",
                    fontWeight: "500",
                    fontSize: "14px"
                  }}>
                    <UserIcon size={20} color="#667eea" />
                    Full Name
                  </label>
                  <input
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "18px 20px",
                      marginBottom: "25px",
                      border: "2px solid #e1e5e9",
                      borderRadius: "15px",
                      fontSize: "16px",
                      transition: "all 0.3s ease",
                      outline: "none",
                      background: "rgba(255,255,255,0.95)"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.boxShadow = "0 0 0 12px rgba(102, 126, 234, 0.25)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e1e5e9";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: "30px" }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                  color: "#555",
                  fontWeight: "500",
                  fontSize: "14px"
                }}>
                  <EmailIcon size={20} color="#667eea" />
                  Email Address
                </label>
                <input
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "18px 20px",
                    marginBottom: "25px",
                    border: "2px solid #e1e5e9",
                    borderRadius: "15px",
                    fontSize: "16px",
                    transition: "all 0.3s ease",
                    outline: "none",
                    background: "rgba(255,255,255,0.95)"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow = "0 0 0 12px rgba(102, 126, 234, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e1e5e9";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{ marginBottom: "25px", position: "relative" }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  color: "#555",
                  fontWeight: "500",
                  fontSize: "14px"
                }}>
                  <LockIcon size={16} />
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      paddingRight: "45px",
                      marginBottom: "16px",
                      border: "2px solid #e1e5e9",
                      borderRadius: "10px",
                      fontSize: "16px",
                      transition: "all 0.3s ease",
                      outline: "none"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e1e5e9";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "5px"
                    }}
                  >
                    {showPassword ? <EyeOffIcon size={16} color="#666" /> : <EyeIcon size={16} color="#666" />}
                  </button>
                </div>
              </div>

              <div style={{
                display: "flex",
                gap: "15px",
                marginTop: "30px"
              }}>
                <button
                  style={{
                    padding: "16px 28px",
                    background: "rgba(255,255,255,0.1)",
                    color: "#FF6B6B",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "#FF6B6B";
                    e.target.style.color = "white";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                    e.target.style.color = "#FF6B6B";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
    }}
                  onMouseOut={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                    e.target.style.color = "#FF6B6B";
                    e.target.style.transform = "translateY(0)";
                  }}
  >
                  {isLoginMode ? "Sign Up" : "Login"}
                </button>
              </div>

              ) : (

              <div>

              </div>

  )}

              {/* RESULT */}

              {prediction && (

                <div style={{
                  marginTop: "20px",
                  padding: "15px",
                  borderRadius: "10px",
                  background: isFake ? "#ffe5e5" : "#e6ffe6",
                  border: isFake ? "2px solid red" : "2px solid green",
                  textAlign: "center"
                }}>

                  <h3 style={{ color: isFake ? "red" : "green" }}>
                    {isFake ? "🔴 Fake Review" : "🟢 Genuine Review"}
                  </h3>

                  {/* CONFIDENCE BAR */}

                  <div style={{ marginTop: "10px" }}>

                    <div style={{
                      height: "20px",
                      background: "#ddd",
                      borderRadius: "10px",
                      overflow: "hidden"
                    }}>

                      <div style={{
                        width: `${confidence}%`,
                        height: "100%",
                        background: isFake ? "red" : "green",
                        transition: "0.5s"
                      }} />

                    </div>

                    <p>Confidence: {confidence}%</p>

                  </div>

                  {/* SUSPICIOUS WORDS */}

                  {suspiciousWords.length > 0 && (

                    <p style={{ color: "red" }}>
                      Suspicious words: {suspiciousWords.join(", ")}
                    </p>

                  )}

                  {/* EXPLANATION */}

                  <p style={{ color: "#444" }}>
                    <b>Explanation:</b> {getExplanation()}
                  </p>

                </div>

              )}

              {/* CHART */}

              {history.length > 0 && (

                <div style={{ marginTop: "25px" }}>

                  <h3>Detection Chart</h3>

                  <div>
                    Fake Reviews
                    <div style={{
                      height: "20px",
                      width: fakeCount * 40,
                      background: "red"
                    }} />
                  </div>

                  <div>
                    Genuine Reviews
                    <div style={{
                      height: "20px",
                      width: genuineCount * 40,
                      background: "green"
                    }} />
                  </div>

                </div>

              )}

              {/* HISTORY */}

              {history.length > 0 && (

                <div style={{ marginTop: "25px" }}>

                  <h3>Review History</h3>

                  {history.map((h, i) => (
                    <div key={i} style={{
                      borderBottom: "1px solid #ddd",
                      padding: "6px"
                    }}>
                      <b style={{ color: h.prediction === "Fake" ? "red" : "green" }}>
                        {h.prediction}
                      </b>
                      ({h.confidence}%)
                      <br />
                      {h.review}
                    </div>
                  ))}

                </div>

              )}

            </div>

  </div>

      </div>
    </div>
  </div >
  </div >
  </>
  );

}
