import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: 'primary' | 'secondary' | 'accent' | 'destructive';
}

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  accent: 'bg-accent/10 text-accent',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({ icon, label, value, color = 'primary' }: StatCardProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl p-5 shadow-sm border border-border"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color]}`}
        >
          {icon}
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      </div>
      <span className="text-2xl font-extrabold text-foreground">{value}</span>
    </motion.div>
  );
}
