import { useEffect, useRef } from "react";

const styles = {
  overlay: {
    position: "fixed",
    top: "25%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#1e293b",
    border: "1px solid #ef4444",
    borderRadius: "14px",
    padding: "2rem 2.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.2rem",
    minWidth: "320px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  alertText: {
    color: "#f87171",
    fontSize: "1.1rem",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: "1.6",
  },
  resumeBtn: {
    padding: "0.8rem 2.2rem",
    fontSize: "1rem",
    fontWeight: "700",
    backgroundColor: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    letterSpacing: "0.05em",
  },
};

export default function Feedback({
  isDistracted,
  isSessionActive,
  onResume,
}) {
  const audioRef = useRef(null);

  // Initialize buzzer
  useEffect(() => {
    audioRef.current = new Audio("/buzzer.mp3");
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play / Stop audio + Notification
  useEffect(() => {
    const buzzer = audioRef.current;
    if (!buzzer) return;

    if (isDistracted && isSessionActive) {
      buzzer.play().catch(() => {});

      if (Notification.permission === "granted") {
        new Notification("LOOOKIE_DOOKIE", {
          body: "Hey, don’t get sleep 😴 — stay focused!",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    } else {
      buzzer.pause();
      buzzer.currentTime = 0;
    }
  }, [isDistracted, isSessionActive]);

  if (!isDistracted || !isSessionActive) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.alertText}>
        🚨 Hey student, what are you looking at? Lock in.
      </div>
      <button style={styles.resumeBtn} onClick={onResume}>
        ▶ Resume Study
      </button>
    </div>
  );
}