// interface PomodoroStepperProps {
//   current: number;
//   total: number;
// }

// export function PomodoroStepper({ current, total }: PomodoroStepperProps) {
//   return (
//     <div className="flex gap-2 items-center justify-center mt-4">
//       {Array.from({ length: total }, (_, i) => (
//         <span
//           key={i}
//           role="img"
//           className={`w-3 h-3 rounded-full transition-colors duration-300 ${
//             i < current ? 'bg-primary' : 'bg-border'
//           }`}
//           aria-label={i < current ? 'Completed cycle' : 'Remaining cycle'}
//         />
//       ))}
//     </div>
//   );
// }
