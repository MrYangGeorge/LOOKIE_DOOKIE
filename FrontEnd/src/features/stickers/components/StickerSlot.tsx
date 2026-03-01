import { motion } from 'framer-motion';
import type { StickerDefinition } from '../data/catalog';

interface StickerSlotProps {
  sticker: StickerDefinition;
  unlocked: boolean;
}

export function StickerSlot({ sticker, unlocked }: StickerSlotProps) {
  return (
    <motion.div
      className={`relative flex flex-col items-center p-3 rounded-2xl transition-all ${
        unlocked
          ? 'bg-white shadow-md ring-2 ring-primary/30'
          : 'bg-muted/50 opacity-60'
      }`}
      whileHover={unlocked ? { scale: 1.05 } : {}}
    >
      {/* Sticker icon */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
          unlocked
            ? 'bg-gradient-to-br from-primary/20 to-secondary/20'
            : 'bg-muted grayscale'
        }`}
      >
        <span className={unlocked ? '' : 'opacity-30'}>{sticker.icon}</span>
      </div>

      {/* Sticker name */}
      <p
        className={`mt-2 text-xs font-semibold text-center leading-tight ${
          unlocked ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        {sticker.name}
      </p>

      {/* Description (unlocked only) */}
      {unlocked && (
        <p className="mt-1 text-[10px] text-muted-foreground text-center leading-tight">
          {sticker.description}
        </p>
      )}

      {/* Locked indicator */}
      {!unlocked && (
        <div className="w-full mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-border rounded-full" style={{ width: '0%' }} />
        </div>
      )}

      {/* Subtle glow for unlocked */}
      {unlocked && (
        <div className="absolute inset-0 rounded-2xl bg-primary/5 pointer-events-none" />
      )}
    </motion.div>
  );
}
