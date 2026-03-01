import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

let eyesOpen = true;

io.on('connection', (socket) => {
  console.log(`[Mock Server] Client connected: ${socket.id}`);

  // Send simulated eye_state events at ~5 Hz
  const simulationInterval = setInterval(() => {
    socket.emit('metrics', {
  alertnessScore: Math.floor(60 + Math.random() * 40),
  blinkRate: Math.floor(10 + Math.random() * 20),
  brightness: Math.floor(300 + Math.random() * 500),
  temperature: Math.floor(65 + Math.random() * 15),
  eyeClosed: !eyesOpen,
  timestamp: Date.now(),
});
    // Randomly close eyes ~10% of the time
    if (eyesOpen && Math.random() < 0.1) {
      eyesOpen = false;
      // Re-open after 1-8 seconds
      const closedDuration = 1000 + Math.random() * 7000;
      setTimeout(() => {
        eyesOpen = true;
      }, closedDuration);
    }

    socket.emit('eye_state', {
      eyes_open: eyesOpen,
      confidence: 0.85 + Math.random() * 0.15,
      timestamp: Date.now(),
    });
  }, 200);

  socket.on('override_th', (payload: { threshold: number }) => {
    console.log(`[Mock Server] Threshold override: ${payload.threshold}s`);
  });

  // Press Enter in terminal to simulate alarm_dismissed
  const stdinHandler = () => {
    console.log('[Mock Server] Simulating alarm_dismissed');
    socket.emit('alarm_dismissed', { timestamp: Date.now() });
  };
  process.stdin.on('data', stdinHandler);

  socket.on('disconnect', () => {
    console.log(`[Mock Server] Client disconnected: ${socket.id}`);
    clearInterval(simulationInterval);
    process.stdin.removeListener('data', stdinHandler);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`[Mock Server] Running on http://localhost:${PORT}`);
  console.log('[Mock Server] Press Enter to simulate alarm_dismissed');
});
