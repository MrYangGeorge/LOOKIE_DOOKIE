import { motion } from 'framer-motion';
import { FocusTimer } from '@/features/timer/components/FocusTimer';
import { useSessionManager } from '@/features/stats/hooks/useSessionManager';
import { ConnectionStatus } from '@/features/detection/components/ConnectionStatus';
import { SessionSummary } from '@/features/stats/components/SessionSummary';
import { Dashboard } from '@/features/stats/components/Dashboard';
import { SettingsPanel } from '@/features/settings/components/SettingsPanel';
import { StickerBook } from '@/features/stickers/components/StickerBook';
import { UnlockAnimation } from '@/features/stickers/components/UnlockAnimation';
import { useStickerChecker } from '@/features/stickers/hooks/useStickerChecker';
import { SoundMixer } from '@/features/ambient/components/SoundMixer';
import { useAmbientAutoStop } from '@/features/ambient/hooks/useAmbientAutoStop';
import { ChatPanel } from '@/features/chatbot/components/ChatPanel';
import { useChatStore } from '@/features/chatbot/store/chatStore';
import { LiveAlertnessChart } from '@/features/stats/components/LiveAlertnessChart';
import { useAlertnessFeed } from '@/features/stats/hooks/useAlertnessFeed';
import { useTimerStore } from '@/features/timer/store/timerStore';
import VideoStream from '@/features/detection/components/VideoStream';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: 'easeOut' as const },
};

export function HomePage() {
  useSessionManager();
  useStickerChecker();
  useAmbientAutoStop();
  useAlertnessFeed();

  const phase = useTimerStore((s) => s.phase);
  const showLiveChart = phase === 'focus' || phase === 'break';
  

  return (
    <motion.div {...pageTransition} className="max-w-lg mx-auto px-4 pt-12">
     
      <FocusTimer />
      {showLiveChart && (
        <div className="mt-6">
          <LiveAlertnessChart />
        </div>
      )}
      <div className="mt-6">
        <VideoStream />
        <SoundMixer />  
      </div>
      <ConnectionStatus />
      <SessionSummary />
      <UnlockAnimation />
    </motion.div>
  );
}

export function StatsPage() {
  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 pt-8 pb-8">
      <h1 className="text-3xl font-extrabold text-foreground">Stats</h1>
      <p className="text-muted-foreground mt-2 mb-6">Track your focus journey.</p>
      <Dashboard />
    </motion.div>
  );
}

export function StickersPage() {
  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 pt-8">
      <h1 className="text-3xl font-extrabold text-foreground">Stickers</h1>
      <p className="text-muted-foreground mt-2 mb-6">Collect stickers by achieving focus milestones!</p>
      <StickerBook />
    </motion.div>
  );
}

import { RotateCcw } from 'lucide-react';

export function ChatPage() {
  const messages = useChatStore((s) => s.messages);
  const { clearMessages } = useChatStore((s) => s.actions);

  return (
    <motion.div {...pageTransition} className="max-w-2xl mx-auto px-4 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Chat</h1>
          <p className="text-muted-foreground text-sm">Your personal focus coach.</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors rounded-full border border-border hover:border-destructive/30"
          >
            <RotateCcw size={12} />
            New Session
          </button>
        )}
      </div>
      <ChatPanel />
    </motion.div>
  );
}

export function SettingsPage() {
  return (
    <motion.div {...pageTransition} className="max-w-2xl mx-auto px-4 pt-8">
      <h1 className="text-3xl font-extrabold text-foreground">Settings</h1>
      <p className="text-muted-foreground mt-2 mb-6">Customize your focus experience.</p>
      <SettingsPanel />
    </motion.div>
  );
}
