import { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { SuggestedPrompts } from './SuggestedPrompts';

export function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const { sendMessage } = useChatStore((s) => s.actions);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return;
    sendMessage(text.trim());
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center pt-6">
            <div className="text-5xl mb-3">🤖</div>
            <h2 className="text-2xl font-extrabold text-foreground mb-1">
              Lookie Dookie AI
            </h2>
            <p className="text-muted-foreground mb-5">
              Ask me anything about your focus habits!
            </p>
            <SuggestedPrompts onSelect={handleSend} />
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoading && messages[messages.length - 1]?.content === '' && (
          <TypingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-border pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputRef.current?.value || '');
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about your focus habits..."
            className="flex-1 px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-95 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
