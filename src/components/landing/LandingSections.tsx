import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface Props {
  scansCount: number;
  spotsLeft: number;
  onAuth: () => void;
}

const LandingSections = ({ scansCount, spotsLeft, onAuth }: Props) => {
  return (
    <>
      {/* Section 4: Pain + False Beliefs */}
      <section className="py-16 px-4 bg-page">
        <div className="max-w-[680px] mx-auto">
          <h2 className="font-display section-h2 text-ink text-center mb-3">
            4 lies you believe about parking your car
          </h2>
          <p className="text-body font-body text-base text-center mb-10">
            Every one of these costs you money. Let's break them.
          </p>
          <div className="space-y-4">
            {[
              { icon: '🎫', title: '"The ticket says they\'re not liable."', body: "Legally, it often doesn't hold up. But here's the catch: without documented proof of your car's condition BEFORE handover, you can't win the dispute. The disclaimer works because you have no evidence — not because it's enforceable.", cost: 'Your insurance deductible: $500-1,000. For a scratch you didn\'t cause.' },
              { icon: '📱', title: '"I snap a few photos with my phone."', body: "No structured angles. No metadata chain. No mutual confirmation. No comparison engine. In a dispute, the valet says 'those photos could be from any time.' And they'd be right.", cost: "A false sense of security that collapses the moment you need it." },
              { icon: '🎲', title: '"It rarely happens."', body: "Parking lot incidents are among the most common low-speed damage claims in insurance data. Door dings, bumper scrapes, wheel curb rash — every single day, at every parking garage. Most go unreported because proving fault is impossible.", cost: '$1,000-5,000+ in cumulative damage you\'ll discover at trade-in.' },
              { icon: '💸', title: '"It\'s not worth $2.97/month."', body: "One dispute costs $500+ in deductibles. One repair costs $800-3,000+. One missed claim reduces resale by thousands. CarShake pays for itself 170x over after a single incident.", cost: "That's 14 YEARS of CarShake in one avoided deductible." },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-card border border-border shadow-card p-6 border-l-4 border-l-status-red">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{card.icon}</span>
                  <h3 className="font-display text-lg font-bold text-ink">{card.title}</h3>
                </div>
                <p className="text-body font-body text-[15px] leading-relaxed mb-4">{card.body}</p>
                <div className="bg-status-red/5 rounded-lg p-3">
                  <p className="text-sm font-body text-status-red font-medium">💥 Real cost: {card.cost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: QR Handshake */}
      <section className="py-16 px-4 bg-dark">
        <div className="max-w-[680px] mx-auto">
          <p className="text-xs font-body font-bold tracking-[3px] uppercase text-[#C9A237] mb-4 text-center">HOW THE PROTECTION WORKS</p>
          <h2 className="font-display section-h2 text-white text-center mb-12">
            The QR handshake: <em className="text-gold italic">a signed agreement both sides can't deny.</em>
          </h2>
          {[
            { icon: '📸', title: 'You scan. It\'s recorded.', body: "Open CarShake in your browser. Guided prompts walk you through 8 angles in 60 seconds. Each photo is stamped with GPS coordinates, exact time, and your device ID. This isn't a photo — it's a piece of evidence.", security: 'SHA-256 hash locks every photo. Any tampering breaks the chain.' },
            { icon: '🤝', title: 'They scan your QR. They sign.', body: "A QR code appears on your screen. The parking attendant scans it with their own phone — no app needed. They see your photos. They tap 'Confirm Condition.' That tap is a digital signature — timestamped, device-fingerprinted, and stored permanently.", security: 'This is a mutual agreement. Both parties confirmed the car\'s condition. Neither side can later claim otherwise.' },
            { icon: '🔍', title: 'You return. AI is your witness.', body: 'When you pick up your car, scan again from the same angles. Claude Vision AI compares every pair — pixel by pixel — and delivers a verdict in seconds: \'No changes\' or \'Differences found\' with exact locations and severity.', security: 'The comparison is timestamped and attached to both signed records. This is a complete evidence package.' },
          ].map((step, i) => (
            <div key={i} className="mb-10">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-2xl flex-shrink-0">{step.icon}</div>
                <h3 className="font-display text-xl font-bold text-white">{step.title}</h3>
              </div>
              <p className="text-[#A1A1AA] font-body text-[15px] leading-relaxed mb-3 ml-16">{step.body}</p>
              <div className="ml-16 bg-gold/10 border border-gold/20 rounded-lg p-3">
                <p className="text-sm font-body text-[#D4B04A]">🔒 {step.security}</p>
              </div>
            </div>
          ))}
          <div className="text-center mt-8">
            <a href="#demo" className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-[12px] bg-gold text-ink font-body font-semibold hover:bg-gold-dark transition">
              Try It Now — See AI Compare Your Photos
            </a>
          </div>
        </div>
      </section>

      {/* Section 6: Legal Shield */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-[680px] mx-auto">
          <h2 className="font-display section-h2 text-ink text-center mb-3">
            This isn't a camera app. <em className="text-gold italic">It's a legal shield.</em>
          </h2>
          <p className="text-body font-body text-base text-center mb-10">
            Every piece of CarShake exists for one reason: to make sure you never lose a dispute you shouldn't lose.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: '📍', title: 'GPS-verified location', body: 'Proves exactly WHERE photos were taken.', shield: 'Accepted as digital evidence in US and EU courts.' },
              { icon: '⏱️', title: 'Dual-verified timestamps', body: "Your phone + our server. Can't be faked.", shield: "Tamper-proof. Server timestamps can't be faked by either party." },
              { icon: '✍️', title: "Attendant's digital signature", body: 'They scanned. They confirmed. They signed.', shield: "This is the evidence that ends 'he said, she said' forever." },
              { icon: '🔐', title: 'SHA-256 tamper-proof hash', body: 'One changed pixel breaks the chain.', shield: 'The same cryptographic standard used by banks and blockchain.' },
              { icon: '🧠', title: 'AI witness comparison', body: 'No human bias. The AI saw everything.', shield: "AI findings are attached to the evidence package with their own timestamp." },
              { icon: '📄', title: 'Court-ready PDF evidence', body: 'Hand it to your lawyer or insurer.', shield: 'Formatted to match what insurance adjusters and courts actually need.' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-card border border-border shadow-card p-5 border-l-4 border-l-gold">
                <div className="flex items-center gap-2 mb-2">
                  <span>{card.icon}</span>
                  <h3 className="font-display text-[16px] font-bold text-ink">{card.title}</h3>
                </div>
                <p className="text-body font-body text-sm mb-2">{card.body}</p>
                <p className="text-xs font-body text-gold">🛡️ {card.shield}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Without CarShake */}
      <section className="py-16 px-4 bg-page">
        <div className="max-w-[680px] mx-auto">
          <h2 className="font-display section-h2 text-ink text-center mb-8">
            Without CarShake, here's what happens when you find a scratch:
          </h2>
          <div className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
            <ol className="space-y-4">
              {[
                { emoji: '😠', action: 'You point out the damage.', response: "They say: 'It was already there.'" },
                { emoji: '📋', action: 'You ask for the manager.', response: "Manager points at the ticket: 'We are not liable for damages.'" },
                { emoji: '📱', action: 'You say you have phone photos.', response: "'Those could be from anywhere.'" },
                { emoji: '💸', action: 'You file with YOUR insurance.', response: 'You pay your deductible: $500-1,000.' },
                { emoji: '📈', action: 'Your premium goes up.', response: 'You pay more next year. For a scratch the valet caused.' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 font-body text-[15px]">
                  <span className="text-xl">{item.emoji}</span>
                  <div>
                    <strong className="text-ink">{i + 1}. {item.action}</strong>{' '}
                    <span className="text-body">→ {item.response}</span>
                  </div>
                </li>
              ))}
              <li className="flex items-start gap-3 font-body">
                <span className="text-xl">🔥</span>
                <div>
                  <strong className="text-ink">6. Total cost of one scratch you didn't cause:</strong>
                  <p className="font-display text-3xl font-bold text-status-red mt-1">$1,500 - $5,000+</p>
                </div>
              </li>
            </ol>
          </div>
          <div className="bg-status-green/5 border border-status-green/20 rounded-card p-6">
            <p className="font-body text-[15px] text-body leading-relaxed">
              <strong className="text-ink">With CarShake, step 1 goes differently:</strong> You open the CarShake comparison report. You show the attendant: timestamped before photos, their own digital signature confirming the car was clean, and AI analysis showing exactly where the new scratch is. They call their manager. The manager sees the evidence. They pay for the repair.{' '}
              <strong className="text-status-green">Total cost: $0. Time: 30 seconds.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Section 8: Epiphany Bridge */}
      <section className="py-16 px-4 bg-page">
        <div className="max-w-[680px] mx-auto">
          <p className="text-xs font-body font-bold tracking-[3px] uppercase text-gold mb-6 text-center">WHY I BUILT THIS</p>
          <div className="border-l-[3px] border-gold pl-6">
            <blockquote className="font-display text-xl italic text-ink mb-6 leading-relaxed">
              "'€800 for a scratch I didn't cause. That's what it cost me to have no proof.'"
            </blockquote>
            <div className="space-y-4 font-body text-[15px] text-body leading-relaxed">
              <p>Athens. Hotel valet. I got my car back with a scrape on the rear bumper. The manager pointed at the ticket. The attendant shrugged.</p>
              <p>I had photos on my phone — but they were useless. No timestamps anyone would trust. No mutual agreement. No way to prove the car was clean when I handed it over.</p>
              <p>Then I realized: <strong className="text-ink">the valet has the same problem.</strong> When a customer falsely accuses them, they have no defense either. Both sides are blind. Both sides lose.</p>
              <p>The solution wasn't better cameras. It was a <strong className="text-ink">signed agreement between both parties</strong> — created in 60 seconds, verified by AI, and impossible to dispute.</p>
              <p><strong className="text-ink">The QR code isn't a feature. It's a handshake.</strong> Both sides sign. Both sides are protected. That's CarShake.</p>
            </div>
            <p className="text-muted-custom text-sm font-body mt-4">— Maryan, founder</p>
          </div>
        </div>
      </section>

      {/* Section 9: Who Not For / Who For */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-[680px] mx-auto grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-card border border-border shadow-card p-6">
            <h3 className="font-display text-lg font-bold text-status-red mb-4">❌ CarShake is NOT for you if:</h3>
            <ul className="space-y-3 font-body text-[15px] text-body">
              <li>• You enjoy paying for other people's mistakes</li>
              <li>• You trust that a paper ticket protects you</li>
              <li>• You think your camera roll counts as evidence</li>
              <li>• You've never found an unexplained scratch on your car</li>
            </ul>
          </div>
          <div className="bg-white rounded-card border border-border shadow-card p-6">
            <h3 className="font-display text-lg font-bold text-status-green mb-4">✓ You need CarShake if:</h3>
            <ul className="space-y-3 font-body text-[15px] text-body">
              <li>• You use valet, airport parking, hotel garages, or body shops</li>
              <li>• You've paid a deductible for damage you didn't cause — even once</li>
              <li>• You want the parking attendant to SIGN that your car was clean</li>
              <li>• You believe 60 seconds of effort beats $1,500 of regret</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 10: Mid-Page CTA */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-[680px] mx-auto text-center">
          <p className="font-display text-2xl font-bold text-ink mb-2">One scratch. One deductible. One premium increase.</p>
          <p className="font-display text-2xl italic text-gold font-bold mb-8">Or 60 seconds of protection.</p>
          <a href="#demo" className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-[12px] bg-gold text-ink font-body font-semibold hover:bg-gold-dark transition">
            🛡️ Try CarShake AI — Free
          </a>
          <p className="text-muted-custom text-sm font-body mt-4">3 free scans/month. No credit card. No signup.</p>
        </div>
      </section>

      {/* Section 11: Social Proof */}
      <section className="py-16 px-4 bg-page">
        <div className="max-w-[680px] mx-auto">
          <h2 className="font-display section-h2 text-ink text-center mb-10">What signed protection looks like</h2>
          <div className="space-y-4">
            {[
              { icon: '✈️', location: 'Airport — JFK', color: 'border-l-status-green', saved: '$2,100 saved', story: 'Door ding discovered at pickup. CarShake comparison showed the exact panel — plus the attendant\'s own confirmation that it wasn\'t there before. Insurance paid in full, zero deductible.' },
              { icon: '🍽️', location: 'Valet — Scottsdale', color: 'border-l-gold', saved: '7-minute resolution', story: "Curb rash on right rear wheel. The valet's manager saw the before/after comparison AND the attendant's digital signature. They paid for the repair on the spot." },
              { icon: '🔧', location: 'Body Shop — Miami', color: 'border-l-status-amber', saved: '$4,800 in claims', story: 'Caught 2 separate incidents over 6 months of using CarShake. Without the evidence package, both would have been out-of-pocket.' },
            ].map((card, i) => (
              <div key={i} className={`bg-white rounded-card border border-border shadow-card p-6 border-l-4 ${card.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{card.icon}</span>
                  <span className="text-sm font-body text-muted-custom">{card.location}</span>
                </div>
                <p className="font-display text-xl font-bold text-ink mb-2">{card.saved}</p>
                <p className="font-body text-sm text-body">{card.story}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-custom font-body text-center mt-4">Expected outcomes based on industry data</p>
          <p className="text-sm font-body text-center text-body mt-4">
            <strong>{scansCount}</strong> cars protected — <strong className="text-gold">{spotsLeft} founding spots left</strong>
          </p>
        </div>
      </section>

      {/* Section 12: Value Stack */}
      <section className="py-16 px-4 bg-page">
        <div className="max-w-[680px] mx-auto">
          <h2 className="font-display section-h2 text-ink text-center mb-3">What $2.97/mo actually gets you</h2>
          <p className="text-body font-body text-base text-center mb-10">Manual cost vs. your CarShake Shield+ price</p>
          <div className="bg-white rounded-card border-2 border-gold shadow-card p-6">
            <div className="space-y-3 mb-6">
              {[
                { feature: '8-angle guided capture', cost: '$30/scan' },
                { feature: 'GPS + timestamp verification', cost: '$50/incident' },
                { feature: 'QR mutual confirmation', cost: 'Priceless' },
                { feature: 'AI damage comparison', cost: '$150+/assessment' },
                { feature: 'PDF court-ready evidence report', cost: '$200+/document' },
                { feature: 'Full scan history (forever)', cost: '$100+/year' },
                { feature: 'Smart Dispute Letter generator', cost: '$75/letter' },
                { feature: 'Insurance Evidence Package', cost: '$100/package' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between font-body text-sm">
                  <span className="text-ink flex items-center gap-2">
                    <span className="text-status-green">✓</span> {item.feature}
                  </span>
                  <span className="text-muted-custom line-through">{item.cost}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 mb-4">
              <div className="flex items-center justify-between font-body font-bold text-base">
                <span className="text-ink">Total value</span>
                <span className="text-muted-custom line-through">$705+/mo</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-body text-body mb-2">Founding member price:</p>
              <p className="font-display text-[56px] font-bold text-gold leading-none">$2.97</p>
              <p className="font-body text-sm text-muted-custom">/mo</p>
              <p className="font-body text-base font-bold text-ink mt-2">99.6% off. Less than one parking meter.</p>
              <div className="inline-block px-3 py-1 rounded-pill bg-gold/10 text-gold text-xs font-body font-semibold mt-3">
                No credit card to start · 3 free scans/month
              </div>
              <div className="mt-6">
                <button onClick={onAuth} className="w-full max-w-[420px] min-h-[52px] rounded-[12px] bg-gold text-ink font-body font-semibold hover:bg-gold-dark transition">
                  Start Protecting Your Car — Free
                </button>
              </div>
              <p className="text-sm font-body text-body mt-3">🛡️ One prevented dispute pays for 14 years of CarShake.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 13: Guarantees */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-[680px] mx-auto">
          <h2 className="font-display section-h2 text-ink text-center mb-10">4 guarantees. Zero risk.</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '🎯', title: 'Free protection guarantee', body: '3 scans/month including full AI comparison, QR handover, and evidence chain. No credit card. No trial trap.' },
              { icon: '🔬', title: 'AI accuracy guarantee', body: 'If AI misses visible damage in your photos, we manually review and re-issue within 24 hours.' },
              { icon: '⏱️', title: 'One-click cancel', body: 'Cancel from your dashboard. One button. No emails, no calls. Your scan history stays forever.' },
              { icon: '🔒', title: 'Founding price lock', body: 'First 100 users pay $2.97/mo forever. Even when we raise prices.' },
            ].map((g, i) => (
              <div key={i} className="bg-white rounded-card border border-border shadow-card p-5">
                <div className="text-2xl mb-2">{g.icon}</div>
                <h3 className="font-display text-base font-bold text-ink mb-2">{g.title}</h3>
                <p className="font-body text-sm text-body">{g.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 14: Pricing */}
      <section id="pricing" className="py-16 px-4 bg-page">
        <div className="max-w-[680px] mx-auto">
          <h2 className="font-display section-h2 text-ink text-center mb-10">Pick your shield</h2>

          {/* Free */}
          <div className="bg-white rounded-card border border-border shadow-card p-5 mb-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">Free</h3>
              <p className="font-display text-2xl font-bold text-ink">$0<span className="text-sm font-body text-muted-custom font-normal">/forever</span></p>
              <p className="font-body text-sm text-body mt-1">3 scans/mo · AI comparison · QR handover</p>
            </div>
            <button onClick={onAuth} className="min-h-[44px] px-6 rounded-[10px] border-2 border-border text-ink font-body font-semibold hover:bg-surface transition">
              Start Free
            </button>
          </div>

          {/* Shield+ */}
          <div className="bg-white rounded-card border-2 border-gold shadow-card p-6 mb-4 relative">
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-pill bg-gold text-ink text-xs font-body font-semibold">Most Popular</div>
            <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Shield+</h3>
                <p className="font-display text-4xl font-bold text-gold">$2.97<span className="text-sm font-body text-muted-custom font-normal">/mo</span></p>
                <div className="inline-block px-2 py-0.5 rounded-pill bg-gold/10 text-gold text-xs font-body font-semibold mt-1">
                  Founding price · locks forever
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {['Unlimited scans', 'PDF evidence reports', 'Full scan history', 'Priority AI', 'Dispute letter generator', 'Insurance package', 'License plate timeline', 'Cancel anytime'].map((f) => (
                <p key={f} className="text-sm font-body text-body flex items-center gap-1.5">
                  <span className="text-status-green text-xs">✓</span> {f}
                </p>
              ))}
            </div>
            <button onClick={onAuth} className="w-full min-h-[52px] rounded-[12px] bg-gold text-ink font-body font-semibold hover:bg-gold-dark transition">
              Get Shield+ — Start Free →
            </button>
            <p className="text-center text-sm font-body text-body mt-3">🛡️ Full guarantee on every plan</p>
          </div>

          {/* Pro + Enterprise */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-card border border-border shadow-card p-5">
              <h3 className="font-display text-base font-bold text-ink">Pro</h3>
              <p className="font-display text-xl font-bold text-ink mb-2">$19.97<span className="text-sm font-body text-muted-custom font-normal">/mo</span></p>
              <p className="font-body text-sm text-body mb-4">Location dashboard, staff accounts, branded QR, analytics</p>
              <button onClick={onAuth} className="w-full min-h-[44px] rounded-[10px] border-2 border-border text-ink font-body font-semibold hover:bg-surface transition text-sm">
                Go Pro
              </button>
            </div>
            <div className="bg-white rounded-card border border-border shadow-card p-5">
              <h3 className="font-display text-base font-bold text-ink">Enterprise</h3>
              <p className="font-display text-xl font-bold text-ink mb-2">$297<span className="text-sm font-body text-muted-custom font-normal">/mo</span></p>
              <p className="font-body text-sm text-body mb-4">Multi-location, API, white-label</p>
              <button disabled className="w-full min-h-[44px] rounded-[10px] bg-surface text-muted-custom font-body font-semibold text-sm cursor-not-allowed">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 15: FAQ */}
      <section id="faq" className="py-16 px-4 bg-surface">
        <div className="max-w-[680px] mx-auto">
          <h2 className="font-display section-h2 text-ink text-center mb-10">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              { q: 'Do I need to download an app?', a: "No. CarShake runs entirely in your mobile browser. No app store, no installation, no storage used. Open the link, scan your car, done." },
              { q: 'How does the QR handshake work?', a: "After you scan your car, a QR code appears on your screen. The parking attendant scans it with their phone camera. They see your photos and tap 'Confirm.' That creates a mutual digital agreement — timestamped and device-fingerprinted." },
              { q: 'What if the attendant refuses to scan?', a: "You have 3 alternatives: send the confirmation link via SMS, record a verbal confirmation, or photograph their badge. Your scan is still timestamped and GPS-verified regardless." },
              { q: 'Is the AI comparison accurate?', a: "CarShake uses Claude Vision AI to compare photos angle by angle. If AI misses visible damage, we manually review and re-issue within 24 hours — that's our AI accuracy guarantee." },
              { q: 'How much does it cost?', a: "Free plan: 3 scans/month with full AI comparison and QR handover. Shield+: $2.97/month (founding price, locked forever) for unlimited scans, PDF reports, dispute letters, and more." },
              { q: 'Can this be used as legal evidence?', a: "CarShake creates GPS-verified, dual-timestamped, mutually confirmed records with SHA-256 cryptographic hashing. This evidence package is formatted to match what insurance adjusters and courts actually need." },
              { q: 'How do I cancel?', a: "One click from your dashboard. No emails, no calls, no retention tricks. Your scan history stays forever even after cancellation." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-card border border-border shadow-card px-5">
                <AccordionTrigger className="font-body font-semibold text-ink text-[15px] text-left py-4 min-h-[48px]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-body text-sm pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Section 16: Final CTA */}
      <section className="py-16 px-4 bg-page">
        <div className="max-w-[680px] mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-pill bg-gold/10 text-gold text-xs font-body font-semibold mb-6">
            {scansCount} cars protected · {spotsLeft} founding spots left
          </div>
          <p className="text-body font-body text-base mb-4">
            Every handover without a signed record is a risk you don't need to take.
          </p>
          <h2 className="font-display hero-h1 text-ink mb-8">
            Stop hoping the valet is careful. <em className="text-gold italic">Start with proof.</em>
          </h2>
          <button onClick={onAuth} className="w-full max-w-[420px] min-h-[52px] rounded-[12px] bg-gold text-ink font-body font-semibold hover:bg-gold-dark transition mb-4">
            🛡️ Protect Your Car — Free
          </button>
          <p className="text-muted-custom text-sm font-body mb-3">No app · No signup · No credit card · 60 seconds</p>
          <p className="text-sm font-body text-body">🛡️ One prevented dispute = 14 years of CarShake protection.</p>
        </div>
      </section>
    </>
  );
};

export default LandingSections;
