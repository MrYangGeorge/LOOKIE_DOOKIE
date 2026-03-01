import { ALL_STICKERS, STICKER_CATEGORIES } from '../data/catalog';
import { useStickerStore } from '../store/stickerStore';
import { StickerSlot } from './StickerSlot';

export function StickerBook() {
  const earnedIds = useStickerStore((s) => s.earnedIds);
  const earnedCount = earnedIds.size;

  return (
    <div className="space-y-8">
      {/* Progress summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-border flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Collection Progress</p>
          <p className="text-xs text-muted-foreground">
            {earnedCount} / {ALL_STICKERS.length} stickers unlocked
          </p>
        </div>
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(earnedCount / ALL_STICKERS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Stickers by category */}
      {STICKER_CATEGORIES.map((cat) => {
        const stickers = ALL_STICKERS.filter((s) => s.category === cat.key);
        const catEarned = stickers.filter((s) => earnedIds.has(s.id)).length;

        return (
          <div key={cat.key}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">{cat.label}</h3>
              <span className="text-xs text-muted-foreground">
                {catEarned}/{stickers.length}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {stickers.map((sticker) => (
                <StickerSlot
                  key={sticker.id}
                  sticker={sticker}
                  unlocked={earnedIds.has(sticker.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
