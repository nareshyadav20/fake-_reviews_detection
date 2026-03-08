import React, { useState } from "react";
import axios from "axios";

function App() {
  const [review, setReview] = useState("");
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(0);

  const detectReview = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/predict", {
        review: review,
      });

      setPrediction(response.data.prediction);
      setConfidence(response.data.confidence);
    } catch (error) {
      console.error(error);
      setPrediction("Error detecting review");
      setConfidence(0);
    }
  };

  const isFake = prediction === "Fake";

  return (
    <div style={{
      textAlign: "center",
      marginTop: "80px",
      fontFamily: "Arial",
      background: "#f5f7fb",
      height: "100vh",
      padding: "40px"
    }}>
      
      <h1 style={{color:"#333"}}>🧠 Fake Review Detector</h1>

      <textarea
        rows="6"
        cols="60"
        placeholder="Enter a product review..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
        style={{
          padding:"15px",
          borderRadius:"8px",
          border:"1px solid #ccc",
          fontSize:"16px"
        }}
      />

      <br/><br/>

      <button
        onClick={detectReview}
        style={{
          padding:"12px 30px",
          fontSize:"16px",
          background:"#007bff",
          color:"white",
          border:"none",
          borderRadius:"6px",
          cursor:"pointer"
        }}
      >
        Detect Review
      </button>

      <br/><br/>

      {prediction && (
        <div style={{
          width:"400px",
          margin:"auto",
          padding:"20px",
          borderRadius:"10px",
          background: isFake ? "#ffe5e5" : "#e6ffe6",
          border: isFake ? "2px solid red" : "2px solid green"
        }}>

          <h2 style={{color: isFake ? "red" : "green"}}>
            {isFake ? "🔴 Fake Review" : "🟢 Genuine Review"}
          </h2>

          <p style={{fontSize:"18px"}}>Confidence: {confidence}%</p>

          <div style={{
            width:"100%",
            background:"#ddd",
            borderRadius:"10px",
            height:"20px"
          }}>
            <div style={{
              width: confidence + "%",
              height:"100%",
              background: isFake ? "red" : "green",
              borderRadius:"10px"
            }}></div>
          </div>

        </div>
      )}

    </div>
  );
}

export default App;