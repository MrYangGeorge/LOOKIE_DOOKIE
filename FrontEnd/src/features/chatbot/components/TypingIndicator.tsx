import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white shadow-sm border border-border px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground/50"
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut' as const,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
