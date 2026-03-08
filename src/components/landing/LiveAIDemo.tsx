import { useState, useRef } from 'react';
import { useAICompare } from '@/hooks/useAICompare';
import { Camera, Search, CheckCircle, AlertTriangle } from 'lucide-react';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const LiveAIDemo = () => {
  const [step, setStep] = useState(1);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [beforeBase64, setBeforeBase64] = useState<string>('');
  const [afterBase64, setAfterBase64] = useState<string>('');
  const { compare, loading, result, error } = useAICompare();
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  const handleBefore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBeforeImage(url);
    setBeforeBase64(await fileToBase64(file));
    setStep(2);
  };

  const handleAfter = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAfterImage(url);
    setAfterBase64(await fileToBase64(file));
  };

  const runComparison = async () => {
    await compare(beforeBase64, afterBase64);
    setStep(3);
  };

  return (
    <section id="demo" className="py-16 px-4 bg-page">
      <div className="max-w-[680px] mx-auto">
        <p className="text-xs font-body font-bold tracking-[3px] uppercase text-gold mb-4 text-center">
          LIVE AI — TRY IT NOW ON YOUR PHONE
        </p>
        <h2 className="font-display section-h2 text-ink text-center mb-4">
          See what our AI catches <em className="text-gold">in real time</em>
        </h2>
        <p className="text-body font-body text-base text-center mb-8 max-w-lg mx-auto">
          Take two photos of the same thing. Our AI analyzes both and tells you exactly what changed.{' '}
          <strong>This is real — powered by Claude Vision.</strong>
        </p>

        {/* Progress tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          {['1. Before', '2. After', '3. AI Compare'].map((label, i) => (
            <div
              key={label}
              className={`px-4 py-2 rounded-pill text-xs font-body font-semibold transition ${
                step === i + 1 ? 'bg-gold text-ink' : step > i + 1 ? 'bg-status-green/10 text-status-green' : 'bg-surface text-body'
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="text-center">
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gold/30 rounded-card p-12 hover:border-gold/60 transition bg-gold-subtle">
                <Camera className="mx-auto mb-4 text-gold" size={48} />
                <p className="font-body font-semibold text-ink text-lg mb-1">Tap to take "Before" photo</p>
                <p className="text-muted-custom text-sm font-body">Opens your camera</p>
              </div>
              <input ref={beforeRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleBefore} />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              {beforeImage && (
                <div className="flex-1">
                  <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-custom mb-2">Before</p>
                  <img src={beforeImage} alt="Before" className="w-full rounded-lg object-cover aspect-[4/3]" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-custom mb-2">After</p>
                {afterImage ? (
                  <img src={afterImage} alt="After" className="w-full rounded-lg object-cover aspect-[4/3]" />
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gold/30 rounded-lg aspect-[4/3] flex flex-col items-center justify-center hover:border-gold/60 transition bg-gold-subtle">
                      <Camera className="text-gold mb-2" size={32} />
                      <p className="font-body text-sm text-ink">Tap to take photo</p>
                    </div>
                    <input ref={afterRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAfter} />
                  </label>
                )}
              </div>
            </div>
            {afterImage && (
              <button
                onClick={runComparison}
                disabled={loading}
                className="w-full min-h-[52px] rounded-[12px] bg-gold text-white font-body font-semibold text-base hover:bg-gold-dark transition flex items-center justify-center gap-2"
              >
                <Search size={18} />
                {loading ? 'AI analyzing...' : '🔍 Run AI Comparison — Free'}
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold mx-auto mb-4" />
                <p className="font-body text-ink font-semibold">AI analyzing your photos...</p>
              </div>
            )}
            {error && (
              <div className="bg-status-red/5 border border-status-red/20 rounded-card p-6 text-center">
                <p className="text-status-red font-body font-semibold">Analysis failed</p>
                <p className="text-body text-sm mt-1 font-body">{error}</p>
                <button onClick={() => setStep(2)} className="mt-4 text-gold font-body font-semibold text-sm">Try again</button>
              </div>
            )}
            {result && (
              <div className={`rounded-card p-6 border ${result.status === 'no_changes' ? 'bg-status-green/5 border-status-green/20' : 'bg-status-red/5 border-status-red/20'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {result.status === 'no_changes' ? (
                    <CheckCircle className="text-status-green" size={28} />
                  ) : (
                    <AlertTriangle className="text-status-red" size={28} />
                  )}
                  <h3 className="font-display text-xl font-bold text-ink">
                    {result.status === 'no_changes'
                      ? '✅ NO CHANGES DETECTED'
                      : `⚠ ${result.differences.length} DIFFERENCES FOUND`}
                  </h3>
                </div>
                <p className="text-body font-body text-sm mb-4">{result.summary}</p>
                {result.differences?.length > 0 && (
                  <ul className="space-y-2">
                    {result.differences.map((d, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-body">
                        <span className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          d.severity === 'severe' ? 'bg-status-red' : d.severity === 'moderate' ? 'bg-status-amber' : 'bg-status-green'
                        }`} />
                        <div>
                          <strong className="text-ink">{d.location}</strong>
                          <span className="text-body"> — {d.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info box */}
        <div className="mt-8 p-4 rounded-card bg-gold-subtle border border-gold-subtle text-sm font-body text-body text-center">
          In the full product: 8 guided angles + QR handover + attendant confirmation + PDF evidence report + full history
        </div>
      </div>
    </section>
  );
};

export default LiveAIDemo;
