import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { track } from '@/lib/posthog';
import { useState } from 'react';

const PricingPage = () => {
  const [annual, setAnnual] = useState(false);

  const tiers = [
    {
      name: 'Free',
      price: annual ? '$0' : '$0',
      period: 'forever',
      desc: 'For drivers who want basic protection when it matters most',
      features: [
        '3 scans/month',
        '8-angle guided capture',
        'QR code handshake with attendant',
        'AI before/after comparison',
        'SHA-256 evidence chain',
        'GPS & timestamp verification',
      ],
      cta: 'Start Free',
      href: '/#demo',
      featured: false,
    },
    {
      name: 'Shield+',
      price: annual ? '$2.48' : '$2.97',
      period: annual ? '/mo (billed $29.76/yr)' : '/mo',
      desc: 'For regular valet users who never want to wonder again',
      fullPrice: annual ? '$5.97/mo' : '$5.97/mo',
      features: [
        'Unlimited scans',
        'PDF court-ready evidence reports',
        'Full scan history (forever)',
        'Priority AI comparison (5 min vs 1 hr)',
        'Smart Dispute Letter generator',
        'Insurance Evidence Package',
        'License plate timeline',
        'Cancel anytime — one click',
      ],
      cta: annual ? 'Get Shield+ — $29.76/yr →' : 'Get Shield+ — $2.97/mo →',
      href: '#',
      featured: true,
      badge: 'Founding Price — Locked Forever',
    },
    {
      name: 'Pro',
      price: '$19.97',
      period: '/mo',
      desc: 'For parking operators managing a single location',
      features: [
        'Everything in Shield+',
        'Location dashboard',
        'Up to 10 staff accounts',
        'Branded QR codes',
        'Scan analytics & reports',
        'Email support',
      ],
      cta: 'Go Pro',
      href: '#',
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-page">
      <Helmet>
        <title>Pricing — CarShake AI Valet Protection</title>
        <meta name="description" content="CarShake pricing: Free for 3 scans/month. Shield+ at $2.97 founding price for unlimited scans, PDF reports, and AI protection. Pro for operators at $19.97." />
        <meta property="og:title" content="Pricing — CarShake AI Valet Protection" />
        <meta property="og:description" content="Free to start. Shield+ at $2.97 founding price locked forever. Real AI valet protection for your car." />
        <link rel="canonical" href="https://carshake.online/pricing" />
      </Helmet>

      <header className="px-4 py-4 border-b border-border bg-white">
        <div className="max-w-[720px] mx-auto">
          <Link to="/" className="font-display text-xl font-bold text-gold">CarShake</Link>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-4 py-12">
        <nav className="text-xs font-body text-muted-custom mb-6">
          <Link to="/" className="hover:text-gold">Home</Link>
          {' / '}
          <span className="text-ink">Pricing</span>
        </nav>

        <h1 className="font-display text-[32px] font-bold text-ink mb-3 text-center">Protection pricing that pays for itself</h1>
        <p className="font-body text-[15px] text-body leading-relaxed mb-6 text-center max-w-lg mx-auto">
          One prevented dispute pays for 14 years of CarShake. 
          <em className="text-gold italic block"> 3 free scans to see for yourself.</em>
        </p>

        {/* Scarcity banner */}
        <div className="max-w-md mx-auto mb-8 p-4 rounded-card bg-status-red/5 border border-status-red/20 text-center">
          <p className="font-body text-sm text-status-red font-semibold">
            ⏳ <span className="font-bold">73 of 100 founding spots claimed</span> — 
            <em className="italic"> after that, Shield+ goes to $5.97/mo</em>
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={`text-sm font-body ${!annual ? 'text-ink font-semibold' : 'text-muted-custom'}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition ${annual ? 'bg-gold' : 'bg-border'} focus:outline-none focus:ring-2 focus:ring-gold/30`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${annual ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-body ${annual ? 'text-ink font-semibold' : 'text-muted-custom'}`}>
            Annual <span className="text-status-green text-xs">Save 17%</span>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`rounded-[14px] p-6 flex flex-col ${
                tier.featured
                  ? 'bg-gold-subtle border-2 border-gold relative shadow-lg scale-[1.02]'
                  : 'bg-white border border-border shadow-card'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 rounded-pill bg-gold text-ink text-[10px] font-body font-bold uppercase tracking-wider shadow-sm">
                  ⭐ {tier.badge}
                </div>
              )}
              {tier.featured && !tier.badge && (
                <span className="absolute top-3 right-3 bg-gold text-white text-[10px] font-body font-bold px-2 py-0.5 rounded-pill uppercase tracking-wider">
                  Popular
                </span>
              )}
              <h2 className="font-display text-xl font-bold text-ink mb-1">{tier.name}</h2>
              
              {/* Price with value stacking */}
              <div className="mb-1">
                <span className="font-display text-[32px] font-bold text-ink">{tier.price}</span>
                <span className="font-body text-sm text-muted-custom ml-1">{tier.period}</span>
              </div>
              {tier.fullPrice && (
                <p className="font-body text-xs text-muted-custom line-through mb-2">Regular price: {tier.fullPrice}</p>
              )}
              <p className="font-body text-sm text-body mb-5 flex-1">{tier.desc}</p>
              
              <ul className="space-y-2.5 mb-6">
                {tier.features.map((feat, j) => (
                  <li key={j} className="font-body text-xs text-body flex items-start gap-2">
                    <span className="text-gold flex-shrink-0 mt-0.5">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <a
                href={tier.href}
                className={`block text-center w-full rounded-[12px] py-3 font-body font-semibold text-sm transition ${
                  tier.featured
                    ? 'bg-gold text-ink hover:bg-gold-dark'
                    : 'bg-dark text-body hover:bg-ink hover:text-white'
                }`}
                onClick={() => track('cta_clicked', { location: 'pricing', tier: tier.name })}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Value Stack — comparison vs doing nothing */}
        <div className="max-w-[680px] mx-auto mb-12">
          <div className="bg-white rounded-card border-2 border-gold shadow-card p-6">
            <h3 className="font-display text-lg font-bold text-ink text-center mb-4">
              What happens if you <em className="text-status-red">don't</em> use CarShake?
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-status-red/5 rounded-card p-4 border border-status-red/20">
                <p className="font-body text-xs font-bold uppercase tracking-wider text-status-red mb-2">Without CarShake</p>
                <ul className="space-y-2">
                  {[
                    'You find a scratch after valet — no proof',
                    'Valet says "it was already there"',
                    'You pay $500-1,000 deductible',
                    'Your premium goes up',
                    "You're angry and helpless",
                  ].map((item, i) => (
                    <li key={i} className="font-body text-sm text-body flex items-start gap-2">
                      <span className="text-status-red flex-shrink-0">✗</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-status-green/5 rounded-card p-4 border border-status-green/20">
                <p className="font-body text-xs font-bold uppercase tracking-wider text-status-green mb-2">With CarShake</p>
                <ul className="space-y-2">
                  {[
                    'You and attendant both signed — condition recorded',
                    'AI comparison shows the new damage immediately',
                    'Manager sees the evidence — they pay',
                    'Zero cost, zero hassle, zero premium increase',
                    'You drive away protected',
                  ].map((item, i) => (
                    <li key={i} className="font-body text-sm text-body flex items-start gap-2">
                      <span className="text-status-green flex-shrink-0">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-center border-t border-border pt-4">
              <p className="font-body text-sm text-body mb-1">Average cost of ONE parking dispute you didn't cause:</p>
              <p className="font-display text-[40px] font-bold text-status-red leading-none mb-2">$1,500</p>
              <p className="font-body text-sm text-muted-custom">vs. <span className="text-status-green font-bold">$0</span> with CarShake Shield+</p>
            </div>
          </div>
        </div>

        {/* Guarantees */}
        <div className="max-w-[680px] mx-auto mb-8">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '🎯', title: 'Free risk-free start', body: '3 scans/month with full AI, QR handshake, and evidence chain. No credit card required.' },
              { icon: '🔒', title: 'Founding price lock', body: 'First 100 users pay $2.97/mo forever. Even after the price goes to $5.97.' },
              { icon: '⏱️', title: 'One-click cancel', body: 'Cancel from your dashboard. Your scan history stays forever.' },
              { icon: '🔬', title: 'AI accuracy guaranteed', body: 'If AI misses visible damage, we manually review and re-issue within 24 hours.' },
            ].map((g, i) => (
              <div key={i} className="bg-white rounded-card border border-border shadow-card p-4">
                <div className="text-2xl mb-1">{g.icon}</div>
                <h4 className="font-display text-base font-bold text-ink mb-1">{g.title}</h4>
                <p className="font-body text-sm text-body">{g.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="font-body text-sm text-body mb-4">Have questions about pricing?</p>
          <Link to="/faq" className="text-gold font-body font-semibold text-sm">Check our FAQ →</Link>
          <div className="mt-4">
            <Link to="/" className="text-gold font-body font-semibold text-sm">← Back to CarShake Home</Link>
          </div>
        </div>
      </main>

      <footer className="bg-dark py-8 px-4 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-display text-gold text-lg font-bold mb-1">CarShake</p>
          <div className="flex justify-center gap-4 text-muted-custom text-sm font-body mb-2">
            <Link to="/how-it-works" className="hover:text-gold">How It Works</Link>
            <Link to="/faq" className="hover:text-gold">FAQ</Link>
            <Link to="/city" className="hover:text-gold">City Guides</Link>
            <Link to="/blog" className="hover:text-gold">Blog</Link>
          </div>
          <p className="text-muted-custom text-sm font-body">© 2026 CarShake · carshake.online</p>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
