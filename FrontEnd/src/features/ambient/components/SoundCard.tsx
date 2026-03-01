import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useAmbientStore } from '../store/ambientStore';

interface SoundCardProps {
  id: string;
  name: string;
  icon: ReactNode;
  color: string;
}

export function SoundCard({ id, name, icon, color }: SoundCardProps) {
  const activeSounds = useAmbientStore((s) => s.activeSounds);
  const { toggle, setVolume } = useAmbientStore((s) => s.actions);

  const isActive = activeSounds.has(id);
  const volume = activeSounds.get(id) ?? 0.5;

  return (
    <motion.div
      className={`relative p-4 rounded-2xl cursor-pointer transition-all border ${
        isActive
          ? 'bg-white shadow-lg border-transparent'
          : 'bg-muted/30 border-border hover:bg-muted/50'
      }`}
      style={{
        boxShadow: isActive ? `0 4px 20px ${color}30` : undefined,
        borderColor: isActive ? color : undefined,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => toggle(id)}
    >
      {/* Active glow */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ backgroundColor: color }}
          animate={{ opacity: [0.04, 0.1, 0.04] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
        />
      )}

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-colors"
        style={{
          backgroundColor: isActive ? color : 'oklch(0.92 0 0)',
          color: isActive ? '#fff' : 'oklch(0.6 0 0)',
        }}
      >
        {icon}
      </div>

      {/* Name */}
      <p
        className={`text-sm font-semibold ${
          isActive ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        {name}
      </p>

      {/* Volume slider (only when active) */}
      {isActive && (
        <div
          className="mt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(id, parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${color} ${volume * 100}%, oklch(0.9 0 0) ${volume * 100}%)`,
            }}
          />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {Math.round(volume * 100)}%
          </p>
        </div>
      )}
    </motion.div>
  );
}
