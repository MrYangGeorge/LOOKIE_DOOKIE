import { useState } from "react";
import Timer from "./components/Timer";

const styles = {
  appContainer: {
    backgroundColor: "#020617",
    minHeight: "100vh",
    padding: "2rem",
  },
  devPanel: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: "#1e293b",
    padding: "1rem",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    border: "1px solid #334155",
  },
  devTitle: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    marginBottom: "0.5rem",
  },
  devButton: {
    padding: "0.4rem 0.8rem",
    fontSize: "0.8rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#0ea5e9",
    color: "#fff",
  },
};

export default function App() {
  // 🔹 Simulated backend states (replace later with real data)
  const [eyeClosed, setEyeClosed] = useState(false);
  const [isLookingAtScreen, setIsLookingAtScreen] = useState(true);
  const [blinkingRate, setBlinkingRate] = useState(15);
  const [roomBrightness, setRoomBrightness] = useState(100);

  return (
    <div style={styles.appContainer}>
      <Timer
        eyeClosed={eyeClosed}
        blinkingRate={blinkingRate}
        isLookingAtScreen={isLookingAtScreen}
        roomBrightness={roomBrightness}
      />

      {/* 🔹 DEV TEST PANEL — remove when backend connected */}
      <div style={styles.devPanel}>
        <div style={styles.devTitle}>Dev Controls (Simulation)</div>

        <button
          style={styles.devButton}
          onClick={() => setEyeClosed((prev) => !prev)}
        >
          Toggle Eye Closed
        </button>

        <button
          style={styles.devButton}
          onClick={() => setIsLookingAtScreen((prev) => !prev)}
        >
          Toggle Looking At Screen
        </button>

        <button
          style={styles.devButton}
          onClick={() => setRoomBrightness((prev) =>
            prev > 30 ? 20 : 100
          )}
        >
          Toggle Room Brightness
        </button>
      </div>
    </div>
  );
}