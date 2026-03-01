import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStickerStore } from '../store/stickerStore';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
}

const CONFETTI_COLORS = ['#A8E6CF', '#FFB7B2', '#C3B1E1', '#FFD93D', '#6BCB77'];

export function UnlockAnimation() {
  const pendingUnlock = useStickerStore((s) => s.pendingUnlock);
  const dismissUnlock = useStickerStore((s) => s.actions.dismissUnlock);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  // Generate confetti when a sticker appears
  useEffect(() => {
    if (!pendingUnlock) {
      setConfetti([]);
      return;
    }

    const particles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 400 - 200,
      y: -(Math.random() * 300 + 100),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
    }));
    setConfetti(particles);
  }, [pendingUnlock]);

  return (
    <AnimatePresence>
      {pendingUnlock && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissUnlock}
        >
          {/* Sticker card */}
          <motion.div
            className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-xs mx-4"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: [0, 1.2, 1], rotate: [10, -5, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 15,
              duration: 0.6,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-5xl mb-4">
              {pendingUnlock.icon}
            </div>

            {/* Title */}
            <h2 className="text-xl font-extrabold text-foreground mb-1">Sticker Unlocked!</h2>

            {/* Sticker name */}
            <p className="text-lg font-bold text-primary">{pendingUnlock.name}</p>

            {/* Description */}
            <p className="text-sm text-muted-foreground text-center mt-2">
              {pendingUnlock.description}
            </p>

            {/* Dismiss button */}
            <button
              onClick={dismissUnlock}
              className="mt-5 px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-full text-sm hover:brightness-95 transition"
            >
              Awesome!
            </button>
          </motion.div>

          {/* Confetti */}
          {confetti.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-3 h-3 rounded-sm pointer-events-none"
              style={{ backgroundColor: p.color }}
              initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                scale: [0, 1, 0.5],
                rotate: p.rotation,
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, ease: 'easeOut' as const }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
