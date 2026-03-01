import { useState, useEffect, useRef } from "react";
import Feedback from "./Feedback";

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#e2e8f0",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#38bdf8",
    marginBottom: "1rem",
    letterSpacing: "0.15em",
  },
  timer: {
    fontSize: "6rem",
    fontWeight: "800",
  },
  durationText: {
    marginTop: "0.5rem",
    fontSize: "0.9rem",
    color: "#94a3b8",
  },
  inputRow: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "1.5rem",
  },
  input: {
    width: "90px",
    padding: "0.6rem",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "#fff",
    textAlign: "center",
  },
  button: {
    padding: "0.7rem 2rem",
    marginTop: "1rem",
    backgroundColor: "#0ea5e9",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
  done: {
    marginTop: "1.5rem",
    fontSize: "1.5rem",
    color: "#4ade80",
    fontWeight: "700",
  },
  resetBtn: {
    marginTop: "1rem",
    padding: "0.6rem 2rem",
    backgroundColor: "#334155",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
  },
};

export default function Timer() {
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [originalDuration, setOriginalDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const [eyeClosed, setEyeClosed] = useState(false);
  const [ignoreEyeUntilOpen, setIgnoreEyeUntilOpen] = useState(false);

  const intervalRef = useRef(null);
  const eyeTimerRef = useRef(null);

  const isSessionActive = timeLeft !== null && !isDone;
  const isDistracted = !isRunning && isSessionActive;

  // -------------------------
  // Countdown Logic
  // -------------------------
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setIsDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // -------------------------
  // Eye Closed > 3 Seconds
  // -------------------------
  useEffect(() => {
    if (!isSessionActive) return;

    if (ignoreEyeUntilOpen) {
      if (!eyeClosed) {
        setIgnoreEyeUntilOpen(false);
      }
      return;
    }

    if (eyeClosed) {
      eyeTimerRef.current = setTimeout(() => {
        setIsRunning(false);
      }, 3000);
    } else {
      clearTimeout(eyeTimerRef.current);
    }

    return () => clearTimeout(eyeTimerRef.current);
  }, [eyeClosed, isSessionActive]);

  // -------------------------
  // Handlers
  // -------------------------
  const handleStart = () => {
    const total =
      (parseInt(minutes) || 0) * 60 +
      (parseInt(seconds) || 0);

    if (total <= 0) return;

    setOriginalDuration(total);
    setTimeLeft(total);
    setIsDone(false);
    setIsRunning(true);
  };

  const handleResume = () => {
    setIgnoreEyeUntilOpen(true);
    setIsRunning(true);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    clearTimeout(eyeTimerRef.current);

    setMinutes("");
    setSeconds("");
    setTimeLeft(null);
    setOriginalDuration(0);
    setIsRunning(false);
    setIsDone(false);
  };

  const formatTime = (sec) => {
    if (sec === null) return "00:00";
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.title}>LOOOKIE_DOOKIE</div>

      <div style={styles.timer}>{formatTime(timeLeft)}</div>

      {originalDuration > 0 && (
        <div style={styles.durationText}>
          Study Duration: {formatTime(originalDuration)}
        </div>
      )}

      {!isRunning && !isDone && timeLeft === null && (
        <>
          <div style={styles.inputRow}>
            <input
              type="number"
              placeholder="Min"
              min="0"
              style={styles.input}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
            <input
              type="number"
              placeholder="Sec"
              min="0"
              max="59"
              style={styles.input}
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
            />
          </div>

          <button style={styles.button} onClick={handleStart}>
            Start Studying
          </button>
        </>
      )}

      {/* Simulate Eye */}
      <button
        style={{
          ...styles.button,
          backgroundColor: eyeClosed ? "#dc2626" : "#334155",
        }}
        onClick={() => setEyeClosed((prev) => !prev)}
      >
        {eyeClosed ? "Eye Closed (Simulated)" : "Eye Open (Simulated)"}
      </button>

      {isDone && (
        <div style={styles.done}>
          YOU DID A GREAT JOB 🎉
        </div>
      )}

      {timeLeft !== null && (
        <button style={styles.resetBtn} onClick={handleReset}>
          Reset Timer
        </button>
      )}

      <Feedback
        isDistracted={isDistracted}
        isSessionActive={isSessionActive}
        onResume={handleResume}
      />
    </div>
  );
}