const LandingJsonLd = () => {
  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CarShake",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser"
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Do I need to download an app?", "acceptedAnswer": { "@type": "Answer", "text": "No. CarShake runs entirely in your mobile browser. No app store, no installation, no storage used. Open the link, scan your car, done." } },
      { "@type": "Question", "name": "How does the QR handshake work?", "acceptedAnswer": { "@type": "Answer", "text": "After you scan your car, a QR code appears on your screen. The parking attendant scans it with their phone camera. They see your photos and tap Confirm. That creates a mutual digital agreement." } },
      { "@type": "Question", "name": "What if the attendant refuses to scan?", "acceptedAnswer": { "@type": "Answer", "text": "You have 3 alternatives: send the confirmation link via SMS, record a verbal confirmation, or photograph their badge. Your scan is still timestamped and GPS-verified regardless." } },
      { "@type": "Question", "name": "Is the AI comparison accurate?", "acceptedAnswer": { "@type": "Answer", "text": "CarShake uses Claude Vision AI to compare photos angle by angle. If AI misses visible damage, we manually review and re-issue within 24 hours." } },
      { "@type": "Question", "name": "How much does it cost?", "acceptedAnswer": { "@type": "Answer", "text": "Free plan includes 3 scans per month with full AI comparison and QR handover. Shield+ is $2.97/month for unlimited scans, PDF reports, and more." } },
      { "@type": "Question", "name": "Can this be used as legal evidence?", "acceptedAnswer": { "@type": "Answer", "text": "CarShake creates GPS-verified, dual-timestamped, mutually confirmed records with SHA-256 hashing. This evidence package is formatted for insurance adjusters and courts." } },
      { "@type": "Question", "name": "How do I cancel?", "acceptedAnswer": { "@type": "Answer", "text": "One click from your dashboard. No emails, no calls, no retention tricks. Your scan history stays forever even after cancellation." } },
    ]
  };

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to protect your car with CarShake",
    "step": [
      { "@type": "HowToStep", "name": "Scan", "text": "Take 8 guided photos of your car in 60 seconds" },
      { "@type": "HowToStep", "name": "Share QR", "text": "Show QR code to parking attendant for mutual confirmation" },
      { "@type": "HowToStep", "name": "Compare", "text": "When you return, scan again and AI compares every angle" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
    </>
  );
};

export default LandingJsonLd;
