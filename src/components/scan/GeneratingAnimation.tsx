import { useState, useEffect } from 'react';
import CarSvg from './CarSvg';

interface GeneratingAnimationProps {
  model: string;
  plate: string;
  colorHex: string;
  colorName: string;
  onComplete: () => void;
}

const MESSAGES = [
  'Identifying your vehicle...',
  'Matching {model} profile...',
  'Applying {color} finish...',
  'Calibrating 8-angle guide...',
  'Activating AI protection...',
];

const GeneratingAnimation = ({ model, plate, colorHex, colorName, onComplete }: GeneratingAnimationProps) => {
  const [progress, setProgress] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
      setRotation(prev => prev + 3);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % MESSAGES.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !revealed) {
      setRevealed(true);
      setTimeout(onComplete, 2000);
    }
  }, [progress, revealed, onComplete]);

  const currentMessage = MESSAGES[messageIdx]
    .replace('{model}', model || 'vehicle')
    .replace('{color}', colorName || 'custom');

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-6">
      {/* Car with rotation and glow */}
      <div className="relative mb-10">
        {revealed && (
          <div
            className="absolute inset-0 rounded-full blur-[60px] opacity-40 transition-opacity duration-1000"
            style={{ backgroundColor: colorHex, transform: 'scale(2)' }}
          />
        )}
        <div
          className={`transition-transform duration-500 ${revealed ? 'scale-125' : ''}`}
          style={{ transform: `rotate(${revealed ? 0 : rotation}deg) scale(${revealed ? 1.25 : 1})` }}
        >
          <CarSvg color={colorHex || '#A8A9AD'} size={140} />
        </div>
      </div>

      {/* Revealed state */}
      {revealed ? (
        <div className="text-center animate-fade-in">
          <h2 className="font-display text-2xl font-bold text-white mb-1">{model}</h2>
          <p className="text-[#C9A237] text-sm font-body font-semibold tracking-[3px]">{plate}</p>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="w-full max-w-[280px] mb-4">
            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#C9A237] rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <p className="text-white/60 text-sm font-body text-center">{currentMessage}</p>
        </>
      )}
    </div>
  );
};

export default GeneratingAnimation;
