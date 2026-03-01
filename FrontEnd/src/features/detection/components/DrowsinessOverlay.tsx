import { motion, AnimatePresence } from 'framer-motion';
import { useDetectionStore } from '../store/detectionStore';
import { audioService } from '@/services/audioService';
import { useEffect, useState } from 'react';

export function DrowsinessOverlay() {
  const isAlarmActive = useDetectionStore((s) => s.isAlarmActive);
  const closedSince = useDetectionStore((s) => s.closedSince);
  const alarmReason = useDetectionStore((s) => s.alarmReason);
  const hardwareDismissed = useDetectionStore((s) => s.hardwareDismissed);
  const dismissAlarm = useDetectionStore((s) => s.actions.dismissAlarm);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isDrowsiness = alarmReason === 'drowsiness';
  const isNavigation = alarmReason === 'navigation';

  // Elapsed time counter (only for drowsiness)
  useEffect(() => {
    if (!isAlarmActive || !closedSince || !isDrowsiness) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - closedSince) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isAlarmActive, closedSince, isDrowsiness]);

  const handleDismiss = () => {
    audioService.stopAlarm();
    dismissAlarm();
  };

  // Colors based on alarm reason
  const bgColor = isNavigation ? 'bg-amber-500' : 'bg-red-500';
  const buttonTextColor = isNavigation ? 'text-amber-600' : 'text-red-600';
  const title = isNavigation ? 'Stay Focused!' : 'WAKE UP!';
  const subtitle = isNavigation
    ? 'You left your focus session'
    : `Drowsy for ${elapsedSeconds}s`;

  return (
    <AnimatePresence>
      {isAlarmActive && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Pulsing background */}
          <motion.div
            className={`absolute inset-0 ${bgColor}`}
            animate={{
              opacity: [0.7, 0.9, 0.7],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />

          {/* Content */}
          <div className="relative z-10 text-center">
            <motion.h1
              className="text-6xl md:text-8xl font-extrabold text-white drop-shadow-lg"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut' as const,
              }}
            >
              {title}
            </motion.h1>

            <motion.p
              className="text-2xl text-white/80 mt-4 font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {subtitle}
            </motion.p>

            <motion.button
              onClick={handleDismiss}
              className={`mt-8 px-8 py-3 bg-white ${buttonTextColor} rounded-full font-bold text-lg shadow-lg hover:bg-white/90 transition-colors`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileTap={{ scale: 0.95 }}
            >
              Dismiss
            </motion.button>

            <motion.p
              className="text-lg text-white/60 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {hardwareDismissed
                ? '\u2713 Hardware dismissed'
                : 'Press the button on your device'}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
