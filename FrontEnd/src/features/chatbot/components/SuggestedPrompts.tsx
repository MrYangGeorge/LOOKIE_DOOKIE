interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const PROMPTS = [
  'How am I doing this week?',
  'Tips to reduce drowsiness',
  'Am I improving?',
  'Help me build a study schedule',
];

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="px-4 py-2 bg-white border border-border rounded-full text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
