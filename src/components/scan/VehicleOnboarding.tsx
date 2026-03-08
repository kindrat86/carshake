import { useState } from 'react';
import { Check } from 'lucide-react';
import CarSvg from './CarSvg';
import { COLOR_SWATCHES } from './constants';

interface VehicleOnboardingProps {
  onComplete: (data: { plate: string; model: string; colorHex: string; colorName: string }) => void;
}

const VehicleOnboarding = ({ onComplete }: VehicleOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [colorHex, setColorHex] = useState('');
  const [colorName, setColorName] = useState('');

  const canProceed = step === 1 ? plate.trim().length >= 2 : step === 2 ? model.trim().length >= 2 : !!colorHex;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({ plate: plate.trim().toUpperCase(), model: model.trim(), colorHex, colorName });
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-500 ${
              s < step ? 'bg-[#C9A237]' : s === step ? 'bg-[#C9A237]' : 'bg-white/10'
            }`} />
          ))}
        </div>
        <p className="text-white/40 text-xs font-body mt-2">Step {step} of 3</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {step === 1 && (
          <div className="w-full max-w-[420px] animate-fade-in">
            <h2 className="font-display text-[28px] font-bold text-white text-center mb-2">
              What's your plate number?
            </h2>
            <p className="text-white/50 text-sm font-body text-center mb-10">Used for identification only</p>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="AB 123 CD"
              autoFocus
              className="w-full bg-transparent border-2 border-white/20 focus:border-[#C9A237] rounded-[12px] px-6 py-4 text-white text-center text-2xl font-body font-bold tracking-[4px] placeholder:text-white/20 placeholder:tracking-[4px] outline-none transition-colors"
            />
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-[420px] animate-fade-in">
            <h2 className="font-display text-[28px] font-bold text-white text-center mb-2">
              What car do you drive?
            </h2>
            <p className="text-white/50 text-sm font-body text-center mb-4">Make, model, and year</p>
            <div className="inline-flex items-center justify-center w-full mb-8">
              <span className="px-3 py-1 rounded-pill bg-white/10 text-[#C9A237] text-xs font-body font-semibold tracking-[2px]">
                {plate}
              </span>
            </div>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. BMW X5 2022"
              autoFocus
              className="w-full bg-transparent border-2 border-white/20 focus:border-[#C9A237] rounded-[12px] px-6 py-4 text-white text-center text-xl font-body font-semibold placeholder:text-white/20 outline-none transition-colors"
            />
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-[420px] animate-fade-in">
            <h2 className="font-display text-[28px] font-bold text-white text-center mb-6">
              What colour?
            </h2>
            
            {/* Car preview */}
            <div className="flex justify-center mb-8">
              <CarSvg color={colorHex || '#A8A9AD'} size={100} />
            </div>

            {/* Color grid */}
            <div className="grid grid-cols-4 gap-3">
              {COLOR_SWATCHES.map(c => (
                <button
                  key={c.hex}
                  onClick={() => { setColorHex(c.hex); setColorName(c.name); }}
                  className="flex flex-col items-center gap-1.5 min-h-[48px]"
                >
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                    colorHex === c.hex ? 'border-[#C9A237] scale-110' : 'border-white/10'
                  }`} style={{ backgroundColor: c.hex }}>
                    {colorHex === c.hex && (
                      <Check size={16} className={c.hex === '#E8E6E0' || c.hex === '#A8A9AD' || c.hex === '#C4A87C' || c.hex === '#C9A237' ? 'text-black' : 'text-white'} />
                    )}
                  </div>
                  <span className="text-[10px] font-body text-white/50 text-center leading-tight">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="w-full max-w-[420px] mx-auto block min-h-[52px] rounded-[12px] bg-[#C9A237] text-[#09090B] font-body font-semibold text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {step === 3 ? 'Continue →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

export default VehicleOnboarding;
