import { Radio, CloudRain, Coffee, TreePine } from 'lucide-react';
import { SoundCard } from './SoundCard';

const SOUNDS = [
  {
    id: 'white-noise',
    name: 'White Noise',
    icon: <Radio size={20} />,
    color: '#B0BEC5',
  },
  {
    id: 'rain',
    name: 'Rain',
    icon: <CloudRain size={20} />,
    color: '#81D4FA',
  },
  {
    id: 'cafe',
    name: 'Cafe',
    icon: <Coffee size={20} />,
    color: '#D4A574',
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: <TreePine size={20} />,
    color: '#A8E6CF',
  },
];

export function SoundMixer() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground">Ambient Sounds</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SOUNDS.map((sound) => (
          <SoundCard
            key={sound.id}
            id={sound.id}
            name={sound.name}
            icon={sound.icon}
            color={sound.color}
          />
        ))}
      </div>
    </div>
  );
}
