import { create } from 'zustand';
import { useSessionStore } from '@/features/stats/store/sessionStore';

// ─── Types ────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;

  actions: {
    sendMessage: (text: string) => Promise<void>;
    clearMessages: () => void;
  };
}

// ─── ZotGPT Config ───────────────────────────────────────────────────────

// API key is handled server-side by the Vite proxy plugin (vite.config.ts).

// ─── System Prompt Builder ──────────────────────────────────────────────

function buildSystemPrompt(): string {
  const sessions = useSessionStore.getState().sessions;
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.date === today);

  const totalFocusSeconds = sessions.reduce((sum, s) => sum + s.focusSeconds, 0);
  const totalSessions = sessions.filter((s) => s.completed).length;
  const totalSleepy = sessions.reduce((sum, s) => sum + s.sleepyCount, 0);
  const todaySleepy = todaySessions.reduce((sum, s) => sum + s.sleepyCount, 0);
  const todayFocusMin = todaySessions.reduce((sum, s) => sum + s.focusSeconds, 0) / 60;
  const avgSleepy = totalSessions > 0 ? totalSleepy / totalSessions : 0;

  // Compute streak
  const completedDates = [
    ...new Set(sessions.filter((s) => s.completed).map((s) => s.date)),
  ].sort().reverse();

  let currentStreak = 0;
  if (completedDates.length > 0) {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
    if (completedDates[0] === today || completedDates[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < completedDates.length; i++) {
        const prev = new Date(completedDates[i - 1]);
        const curr = new Date(completedDates[i]);
        if (Math.round((prev.getTime() - curr.getTime()) / 86_400_000) === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  // Recent sessions summary
  const recent = sessions.slice(0, 5);
  const recentSummary =
    recent.length > 0
      ? recent
          .map(
            (s) =>
              `  - ${s.date}: ${Math.round(s.focusSeconds / 60)}min focus, ${s.sleepyCount} sleepy events, ${s.completed ? 'completed' : 'incomplete'}`,
          )
          .join('\n')
      : '  No recent sessions';

  return `You are Lookie Dookie AI, a friendly and encouraging focus coach.
You help users stay focused, reduce drowsiness, and build better study/work habits.

You have access to this user's focus data:
- Total focus time: ${(totalFocusSeconds / 3600).toFixed(1)} hours
- Total sessions completed: ${totalSessions}
- Current streak: ${currentStreak} days
- Sleepy events today: ${todaySleepy}
- Focus time today: ${todayFocusMin.toFixed(0)} minutes
- Average sleepy events per session: ${avgSleepy.toFixed(1)}

Recent sessions (last 5):
${recentSummary}

Guidelines:
- Be warm, encouraging, and supportive
- Give specific, actionable advice based on their data
- Celebrate their achievements and streaks
- If they are struggling with drowsiness, suggest practical tips (hydration, lighting, posture, breaks)
- Keep responses concise (2-4 paragraphs max)
- Use a casual, friendly tone
- Reference their actual data when relevant`;
}

// ─── ZotGPT API Call ────────────────────────────────────────────────────

async function callZotGPT(
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  // Server-side proxy at /api/zotgpt handles API key and forwards to Azure
  const response = await fetch('/api/zotgpt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      stream: false,
      temperature: 1,
      top_p: 1,
      max_tokens: 1024,
      stop: null,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`ZotGPT API error ${response.status}: ${responseText}`);
  }

  if (!responseText) {
    throw new Error(`Empty response (status ${response.status})`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
  }

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(`No content in response: ${JSON.stringify(data).slice(0, 200)}`);
  }

  return content;
}

// ─── Store ───────────────────────────────────────────────────────────────

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,

  actions: {
    sendMessage: async (text: string) => {
      const state = get();

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      set({
        messages: [...state.messages, userMessage, assistantMessage],
        isLoading: true,
      });

      // Build messages with system prompt + conversation history
      const systemPrompt = buildSystemPrompt();
      const history = state.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: text },
      ];

      try {
        const reply = await callZotGPT(apiMessages);

        const current = get();
        const msgs = current.messages.map((m, i) =>
          i === current.messages.length - 1 && m.role === 'assistant'
            ? { ...m, content: reply }
            : m,
        );
        set({ messages: msgs, isLoading: false });
      } catch (err) {
        const errorMsg = `Could not connect to ZotGPT: ${err instanceof Error ? err.message : 'Unknown error'}`;

        const current = get();
        const msgs = current.messages.map((m, i) =>
          i === current.messages.length - 1 && m.role === 'assistant'
            ? { ...m, content: errorMsg }
            : m,
        );
        set({ messages: msgs, isLoading: false });
      }
    },

    clearMessages: () => {
      set({ messages: [], isLoading: false });
    },
  },
}));
