#!/usr/bin/env node
/**
 * CarShake Localization Engine — v2
 * Generates {lang}/index.html for all 97 languages using translation data files.
 * Run: node i18n/i18n.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const DIST = resolve(import.meta.dirname, '..');
const BASE_HTML_PATH = resolve(DIST, 'index.html');
const SITE = 'https://carshake.online';

// ── 97 Languages ──
const LANGUAGES = [
  { code: 'zh-CN', dir: 'zh-CN', dirName: '简体中文' },
  { code: 'hi', dir: 'hi', dirName: 'हिन्दी' },
  { code: 'es', dir: 'es', dirName: 'Español' },
  { code: 'fr', dir: 'fr', dirName: 'Français' },
  { code: 'ar', dir: 'ar', dirName: 'العربية' },
  { code: 'bn', dir: 'bn', dirName: 'বাংলা' },
  { code: 'pt', dir: 'pt', dirName: 'Português' },
  { code: 'ru', dir: 'ru', dirName: 'Русский' },
  { code: 'ur', dir: 'ur', dirName: 'اردو' },
  { code: 'id', dir: 'id', dirName: 'Bahasa Indonesia' },
  { code: 'de', dir: 'de', dirName: 'Deutsch' },
  { code: 'ja', dir: 'ja', dirName: '日本語' },
  { code: 'mr', dir: 'mr', dirName: 'मराठी' },
  { code: 'te', dir: 'te', dirName: 'తెలుగు' },
  { code: 'tr', dir: 'tr', dirName: 'Türkçe' },
  { code: 'ta', dir: 'ta', dirName: 'தமிழ்' },
  { code: 'vi', dir: 'vi', dirName: 'Tiếng Việt' },
  { code: 'ko', dir: 'ko', dirName: '한국어' },
  { code: 'pa-PK', dir: 'pa-PK', dirName: 'پنجابی' },
  { code: 'fa', dir: 'fa', dirName: 'فارسی' },
  { code: 'it', dir: 'it', dirName: 'Italiano' },
  { code: 'th', dir: 'th', dirName: 'ไทย' },
  { code: 'gu', dir: 'gu', dirName: 'ગુજરાતી' },
  { code: 'kn', dir: 'kn', dirName: 'ಕನ್ನಡ' },
  { code: 'ml', dir: 'ml', dirName: 'മലയാളം' },
  { code: 'or', dir: 'or', dirName: 'ଓଡ଼ିଆ' },
  { code: 'pl', dir: 'pl', dirName: 'Polski' },
  { code: 'uk', dir: 'uk', dirName: 'Українська' },
  { code: 'nl', dir: 'nl', dirName: 'Nederlands' },
  { code: 'ro', dir: 'ro', dirName: 'Română' },
  { code: 'el', dir: 'el', dirName: 'Ελληνικά' },
  { code: 'cs', dir: 'cs', dirName: 'Čeština' },
  { code: 'hu', dir: 'hu', dirName: 'Magyar' },
  { code: 'sv', dir: 'sv', dirName: 'Svenska' },
  { code: 'fi', dir: 'fi', dirName: 'Suomi' },
  { code: 'no', dir: 'no', dirName: 'Norsk' },
  { code: 'da', dir: 'da', dirName: 'Dansk' },
  { code: 'he', dir: 'he', dirName: 'עברית' },
  { code: 'sw', dir: 'sw', dirName: 'Kiswahili' },
  { code: 'am', dir: 'am', dirName: 'አማርኛ' },
  { code: 'so', dir: 'so', dirName: 'Soomaali' },
  { code: 'ha', dir: 'ha', dirName: 'Hausa' },
  { code: 'yo', dir: 'yo', dirName: 'Yorùbá' },
  { code: 'ig', dir: 'ig', dirName: 'Igbo' },
  { code: 'zu', dir: 'zu', dirName: 'isiZulu' },
  { code: 'xh', dir: 'xh', dirName: 'isiXhosa' },
  { code: 'af', dir: 'af', dirName: 'Afrikaans' },
  { code: 'ms', dir: 'ms', dirName: 'Bahasa Melayu' },
  { code: 'my', dir: 'my', dirName: 'မြန်မာဘာသာ' },
  { code: 'km', dir: 'km', dirName: 'ភាសាខ្មែរ' },
  { code: 'lo', dir: 'lo', dirName: 'ລາວ' },
  { code: 'ne', dir: 'ne', dirName: 'नेपाली' },
  { code: 'si', dir: 'si', dirName: 'සිංහල' },
  { code: 'ps', dir: 'ps', dirName: 'پښتو' },
  { code: 'kk', dir: 'kk', dirName: 'Қазақ' },
  { code: 'uz', dir: 'uz', dirName: "O'zbek" },
  { code: 'az', dir: 'az', dirName: 'Azərbaycanca' },
  { code: 'ka', dir: 'ka', dirName: 'ქართული' },
  { code: 'hy', dir: 'hy', dirName: 'Հայերեն' },
  { code: 'mn', dir: 'mn', dirName: 'Монгол' },
  { code: 'tl', dir: 'tl', dirName: 'Tagalog' },
  { code: 'ceb', dir: 'ceb', dirName: 'Cebuano' },
  { code: 'jv', dir: 'jv', dirName: 'Basa Jawa' },
  { code: 'su', dir: 'su', dirName: 'Basa Sunda' },
  { code: 'hmn', dir: 'hmn', dirName: 'Hmoob' },
  { code: 'ku', dir: 'ku', dirName: 'Kurdî' },
  { code: 'tg', dir: 'tg', dirName: 'Тоҷикӣ' },
  { code: 'tk', dir: 'tk', dirName: 'Türkmen' },
  { code: 'sq', dir: 'sq', dirName: 'Shqip' },
  { code: 'sr', dir: 'sr', dirName: 'Српски' },
  { code: 'hr', dir: 'hr', dirName: 'Hrvatski' },
  { code: 'bs', dir: 'bs', dirName: 'Bosanski' },
  { code: 'sk', dir: 'sk', dirName: 'Slovenčina' },
  { code: 'sl', dir: 'sl', dirName: 'Slovenščina' },
  { code: 'lt', dir: 'lt', dirName: 'Lietuvių' },
  { code: 'lv', dir: 'lv', dirName: 'Latviešu' },
  { code: 'et', dir: 'et', dirName: 'Eesti' },
  { code: 'be', dir: 'be', dirName: 'Беларуская' },
  { code: 'bg', dir: 'bg', dirName: 'Български' },
  { code: 'mk', dir: 'mk', dirName: 'Македонски' },
  { code: 'ca', dir: 'ca', dirName: 'Català' },
  { code: 'eu', dir: 'eu', dirName: 'Euskara' },
  { code: 'gl', dir: 'gl', dirName: 'Galego' },
  { code: 'cy', dir: 'cy', dirName: 'Cymraeg' },
  { code: 'ga', dir: 'ga', dirName: 'Gaeilge' },
  { code: 'gd', dir: 'gd', dirName: 'Gàidhlig' },
  { code: 'is', dir: 'is', dirName: 'Íslenska' },
  { code: 'lb', dir: 'lb', dirName: 'Lëtzebuergesch' },
  { code: 'mt', dir: 'mt', dirName: 'Malti' },
  { code: 'yue', dir: 'yue', dirName: '粵語' },
  { code: 'ug', dir: 'ug', dirName: 'ئۇيغۇرچە' },
  { code: 'bo', dir: 'bo', dirName: 'བོད་སྐད' },
  { code: 'bal', dir: 'bal', dirName: 'بلوچی' },
  { code: 'br', dir: 'br', dirName: 'Brezhoneg' },
  { code: 'ilo', dir: 'ilo', dirName: 'Iloko' },
  { code: 'mad', dir: 'mad', dirName: 'Madhura' },
];

const RTL_CODES = ['ar', 'he', 'fa', 'ur', 'ps', 'ug', 'ku', 'bal', 'pa-PK'];

// ── English source ──
const EN = {
  pageTitle: "CarShake — Never Pay for Valet Damage Again. AI Car Scans, Free.",
  pageDesc: "60-second AI-powered car scan before valet. QR handover proof between you and the attendant. Free — no app download. Used by 1,822+ drivers saving thousands.",
  navLogo: "CarShake",
  navHowItWorks: "How It Works",
  navPricing: "Pricing",
  navCities: "Cities",
  navTryFree: "Try Free",
  heroLabel: "The $4,200 Lesson That Built CarShake",
  heroTitle1: "Never Pay for Valet Damage ",
  heroTitleHighlight: "You Didn't Cause",
  heroBody: "60-second AI car scan. QR handover proof. Both sides sign. When damage appears, you have irrefutable court-ready evidence. Free — no app download.",
  heroCTAPrimary: "Scan Your Car — Free →",
  heroCTASecondary: "See How It Works",
  proofScans: "⭐ 1,822+ scans created",
  proofCities: "📍 40+ US cities",
  proofVerified: "🔒 SHA-256 verified",
  storyQuote: "\"I built CarShake because my Ferrari got damaged at valet — and I had zero proof.\"",
  storyP1: "December 2023. I handed my keys to a hotel valet in Beverly Hills. When the car came back, the front splitter was scraped — $4,200 in damage. The valet manager shrugged: \"How do we know it wasn't like that when you dropped it?\"",
  storyP2: "He was right. I had nothing. No photos. No witness. No proof. I paid for the repair out of pocket.",
  storyP3: "That's why I built CarShake. I couldn't save my $4,200 — but I can save yours.",
  oldWayTitle: "❌ The Old Way",
  oldWayDesc: "Hand over your keys. Hope nothing happens. If damage appears — argue, fight, pay out of pocket. No proof = no leverage.",
  newWayTitle: "✅ The CarShake Way",
  newWayDesc: "60-second scan captures 8 angles. QR code creates a mutual digital handshake. AI compares before & after. Court-ready evidence.",
  protocolTitle: "The CarShake 3-Stop Protocol™",
  protocolSubtitle: "Three minutes. Three actions. Zero arguments.",
  stop1Title: "Stop & Scan",
  stop1Desc: "Open CarShake. Walk around your car. 8 photos cover every angle. Takes 60 seconds.",
  stop2Title: "QR Handover Proof",
  stop2Desc: "Show the attendant your QR code. They scan it. Both parties digitally confirm the car's condition.",
  stop3Title: "AI Comparison at Pickup",
  stop3Desc: "When you get your car back, scan again. AI compares every angle, flags every new scratch, dent, or scrape.",
  leadTitle: "Free: The Valet Damage Playbook",
  leadDesc: "5 things valet companies don't want you to know. The exact bailment law loopholes that can save you thousands. Plus: CarShake free trial access.",
  leadPlaceholder: "your@email.com",
  leadButton: "Send Me The Free Playbook →",
  leadSuccess: "✓ Check your email for the free Valet Damage Playbook",
  leadDisclaimer: "No spam. 1 email. Instant download.",
  testimonialsTitle: "What Early Users Say",
  testimonial1: "\"Used CarShake before dropping my Tesla at hotel valet. Came back with curb rash on the rear rim. Showed the manager the before scan — they waived the $600 repair. Saved my whole trip.\"",
  testimonial1Author: "— Marcus T., Los Angeles",
  testimonial2: "\"I valet 3-4 times a week for work. CarShake is my insurance policy. 60 seconds of scanning vs. thousands in potential repairs. No-brainer.\"",
  testimonial2Author: "— Sarah K., New York City",
  finalCTATitle: "Don't let valet damage cost you thousands.",
  finalCTASub: "No app download. 60 seconds. AI-powered. Free.",
  finalCTAButton: "Scan Your Car — Free →",
  topicLabel: "Valet protection guides for every scenario",
  topicValetParking: "Valet Parking",
  topicHotelParking: "Hotel Parking",
  topicAirportParking: "Airport Parking",
  topicRentalCars: "Rental Cars",
  topicBodyShops: "Body Shops",
  topicConcertParking: "Concert Parking",
  topicStreetParking: "Street Parking",
  topicDealership: "Dealership",
  movementTitle: "Join the Movement",
  movementText: "We're building a world where no driver pays for damage they didn't cause. Every scan makes parking more accountable.",
  movementLinkHow: "How It Works",
  movementLinkPricing: "Pricing",
  movementLinkTrust: "Trust & Security",
  movementLinkBlog: "Blog",
  movementLinkFAQ: "FAQ",
  footerBrand: "CarShake",
  footerText: "© 2026 CarShake · carshake.online",
  langLabel: "Language",
  enName: "English",
  faqTitle: "Frequently Asked Questions — CarShake",
  faqDesc: "Everything you need to know about CarShake: pricing, how scans work, QR handover, legal evidence, and more.",
  faqH1: "Frequently Asked Questions",
  pricingTitle: "CarShake Pricing — Free Valet Protection",
  pricingDesc: "Free plan includes 3 scans per month. Shield+ at $2.97/month for unlimited scans, PDF reports, and priority support.",
  pricingH1: "Simple, Transparent Pricing",
  howWorksTitle: "How CarShake Works — AI-Powered Car Protection",
  howWorksDesc: "Scan your car in 60 seconds. QR handover proof. AI compares every angle at pickup. Free, no app download needed.",
  howWorksH1: "How CarShake Works",
  trustTitle: "Trust & Security — CarShake",
  trustDesc: "SHA-256 hashing, GPS verification, server timestamps. Your car condition data is secure and admissible as evidence.",
  trustH1: "Trust & Security",
};

// ── Load all translation data files ──
function loadTranslations() {
  const LANG_MAP = {};
  
  // Load from individual translation chunks
  const chunkFiles = [
    'translations-top25.mjs',
    'translations-26-50.mjs',
    'translations-51-75.mjs',
    'translations-76-97.mjs',
  ];

  for (const chunkFile of chunkFiles) {
    const chunkPath = resolve(import.meta.dirname, chunkFile);
    if (existsSync(chunkPath)) {
      // Dynamic import of the chunk
      const content = readFileSync(chunkPath, 'utf8');
      // Extract the LANG_DATA object using eval (safe, our own generated code)
      try {
        // Make it a proper module
        const tempFile = resolve(import.meta.dirname, `_temp_${chunkFile}`);
        writeFileSync(tempFile, content.replace('export { LANG_DATA };', '// exported'));
        // Just read it and manually parse
        const moduleContent = content;
        // We'll use a simple approach: eval the content after wrapping
        const wrapped = moduleContent
          .replace('export { LANG_DATA };', '')
          .replace('const LANG_DATA =', 'return');
        
        // Actually let's just try dynamic import
        // For Node.js ESM context, we can use createRequire
      } catch (e) {
        console.error(`  ⚠️  Error loading ${chunkFile}: ${e.message}`);
      }
    } else {
      console.log(`  ⚠️  Missing translations file: ${chunkFile}`);
    }
  }

  return LANG_MAP;
}

// ── Try to import from various sources
let LANG_MAP = {};

// Try importing the consolidated file
const consolidatedPath = resolve(import.meta.dirname, 'translations-all.mjs');
let consolidatedExists = existsSync(consolidatedPath);

if (consolidatedExists) {
  try {
    const mod = await import('file://' + consolidatedPath);
    LANG_MAP = mod.LANG_DATA || {};
  } catch (e) {
    console.error(`  ⚠️  Error importing translations-all.mjs: ${e.message}`);
    consolidatedExists = false;
  }
}

// If that failed, try individual chunk files
if (!consolidatedExists || Object.keys(LANG_MAP).length === 0) {
  const chunkFiles = [
    'translations-top25.mjs',
    'translations-26-61.mjs',
    'translations-62-97.mjs',
    'translations-remaining.mjs',
  ];
  
  for (const chunkFile of chunkFiles) {
    const chunkPath = resolve(import.meta.dirname, chunkFile);
    if (existsSync(chunkPath)) {
      try {
        const mod = await import('file://' + chunkPath);
        Object.assign(LANG_MAP, mod.LANG_DATA || {});
        console.log(`  ✓ Loaded ${chunkFile}`);
      } catch (err) {
        console.error(`  ⚠️  Error importing ${chunkFile}: ${err.message}`);
      }
    } else {
      console.log(`  - ${chunkFile} not found, skipping`);
    }
  }
}

// ── Helpers ──
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Build localized HTML ──
function buildLocalizedHtml(langCode, texts, langDir) {
  let baseHtml = readFileSync(BASE_HTML_PATH, 'utf8');
  const isRtl = RTL_CODES.includes(langCode);

  // Replace html lang attribute
  baseHtml = baseHtml.replace(/<html lang="en">/, `<html lang="${langCode}"${isRtl ? ' dir="rtl"' : ''}>`);

  // Replace title
  baseHtml = baseHtml.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(texts.pageTitle)}</title>`);

  // Replace meta description
  baseHtml = baseHtml.replace(
    /<meta name="description"[^>]*\/?>/,
    `<meta name="description" content="${escapeHtml(texts.pageDesc)}">`
  );

  // Replace OG meta
  baseHtml = baseHtml.replace(
    /<meta property="og:title"[^>]*\/?>/,
    `<meta property="og:title" content="${escapeHtml(texts.pageTitle)}">`
  );
  baseHtml = baseHtml.replace(
    /<meta name="twitter:title"[^>]*\/?>/,
    `<meta name="twitter:title" content="${escapeHtml(texts.pageTitle)}">`
  );
  baseHtml = baseHtml.replace(
    /<meta property="og:description"[^>]*\/?>/,
    `<meta property="og:description" content="${escapeHtml(texts.pageDesc)}">`
  );
  baseHtml = baseHtml.replace(
    /<meta name="twitter:description"[^>]*\/?>/,
    `<meta name="twitter:description" content="${escapeHtml(texts.pageDesc)}">`
  );

  // Replace canonical
  const langPath = langDir !== 'en' ? '/' + langDir : '';
  baseHtml = baseHtml.replace(
    /<link rel="canonical"[^>]*\/?>/,
    `<link rel="canonical" href="https://carshake.online${langPath}" />`
  );
  baseHtml = baseHtml.replace(
    /<meta property="og:url"[^>]*\/?>/,
    `<meta property="og:url" content="https://carshake.online${langPath}" />`
  );

  // ── Build hreflang links ──
  const hreflangLinks = LANGUAGES.map(l =>
    `    <link rel="alternate" hreflang="${l.code}" href="https://carshake.online/${l.dir}" />`
  ).join('\n');
  baseHtml = baseHtml.replace('</head>', `    ${hreflangLinks}\n  </head>`);

  // Inject language switcher into header
  // Remove any existing lang switcher first
  baseHtml = baseHtml.replace(/<div class="cs-lang-switcher">[\s\S]*?<\/div>\s*<\/nav>/, '</nav>');
  
  const langSwitcher = `
    <div class="cs-lang-switcher">
      <select class="cs-lang-select" onchange="window.location.href=this.value" aria-label="${escapeHtml(texts.langLabel)}">
        <option value="${langPath || '/'}">${texts.enName}</option>
        ${LANGUAGES.filter(l => l.dir !== langDir).map(l =>
          `<option value="/${l.dir}">${escapeHtml(l.dirName)}</option>`
        ).join('')}
      </select>
    </div>`;

  baseHtml = baseHtml.replace('</nav>', `</nav>${langSwitcher}`);

  // ── Translate body content ──
  // Replace the hero title with gold span
  baseHtml = baseHtml.replace(
    /Never Pay for Valet Damage <span style="color:var\(--cs-gold\)">You Didn't Cause<\/span>/,
    `${escapeHtml(texts.heroTitle1)}<span style="color:var(--cs-gold)">${escapeHtml(texts.heroTitleHighlight)}</span>`
  );

  // Replace all body-level translatable strings using the English strings as anchors
  const replacements = [
    [EN.heroLabel, texts.heroLabel],
    [EN.heroBody, texts.heroBody],
    [EN.heroCTAPrimary, texts.heroCTAPrimary],
    [EN.heroCTASecondary, texts.heroCTASecondary],
    [EN.proofScans, texts.proofScans],
    [EN.proofCities, texts.proofCities],
    [EN.proofVerified, texts.proofVerified],
    [EN.storyQuote, texts.storyQuote],
    [EN.storyP1, texts.storyP1],
    [EN.storyP2, texts.storyP2],
    [EN.storyP3, texts.storyP3],
    [EN.oldWayTitle, texts.oldWayTitle],
    [EN.oldWayDesc, texts.oldWayDesc],
    [EN.newWayTitle, texts.newWayTitle],
    [EN.newWayDesc, texts.newWayDesc],
    [EN.protocolTitle, texts.protocolTitle],
    [EN.protocolSubtitle, texts.protocolSubtitle],
    [EN.stop1Title, texts.stop1Title],
    [EN.stop1Desc, texts.stop1Desc],
    [EN.stop2Title, texts.stop2Title],
    [EN.stop2Desc, texts.stop2Desc],
    [EN.stop3Title, texts.stop3Title],
    [EN.stop3Desc, texts.stop3Desc],
    [EN.leadTitle, texts.leadTitle],
    [EN.leadDesc, texts.leadDesc],
    [EN.leadPlaceholder, texts.leadPlaceholder],
    [EN.leadButton, texts.leadButton],
    [EN.leadSuccess, texts.leadSuccess],
    [EN.leadDisclaimer, texts.leadDisclaimer],
    [EN.testimonialsTitle, texts.testimonialsTitle],
    [EN.testimonial1, texts.testimonial1],
    [EN.testimonial1Author, texts.testimonial1Author],
    [EN.testimonial2, texts.testimonial2],
    [EN.testimonial2Author, texts.testimonial2Author],
    [EN.finalCTATitle, texts.finalCTATitle],
    [EN.finalCTASub, texts.finalCTASub],
    [EN.finalCTAButton, texts.finalCTAButton],
    [EN.topicLabel, texts.topicLabel],
    [EN.topicValetParking, texts.topicValetParking],
    [EN.topicHotelParking, texts.topicHotelParking],
    [EN.topicAirportParking, texts.topicAirportParking],
    [EN.topicRentalCars, texts.topicRentalCars],
    [EN.topicBodyShops, texts.topicBodyShops],
    [EN.topicConcertParking, texts.topicConcertParking],
    [EN.topicStreetParking, texts.topicStreetParking],
    [EN.topicDealership, texts.topicDealership],
    [EN.movementTitle, texts.movementTitle],
    [EN.movementText, texts.movementText],
    [EN.movementLinkHow, texts.movementLinkHow],
    [EN.movementLinkPricing, texts.movementLinkPricing],
    [EN.movementLinkTrust, texts.movementLinkTrust],
    [EN.movementLinkBlog, texts.movementLinkBlog],
    [EN.movementLinkFAQ, texts.movementLinkFAQ],
    [EN.footerBrand, texts.footerBrand],
    [EN.footerText, texts.footerText],
    [EN.navLogo, texts.navLogo],
    [EN.navHowItWorks, texts.navHowItWorks],
    [EN.navPricing, texts.navPricing],
    [EN.navCities, texts.navCities],
    [EN.navTryFree, texts.navTryFree],
  ];

  for (const [oldStr, newStr] of replacements) {
    if (oldStr === newStr) continue;
    const escapedOld = escapeHtml(oldStr);
    const escapedNew = escapeHtml(newStr);
    // Replace in HTML source (already escaped in file)
    baseHtml = baseHtml.split(escapedOld).join(escapedNew);
  }

  // For RTL languages
  if (isRtl) {
    baseHtml = baseHtml.replace('</head>',
      `<style>
html[dir="rtl"] .cs-header-inner { flex-direction: row-reverse; }
html[dir="rtl"] .cs-nav { flex-direction: row-reverse; }
html[dir="rtl"] .cs-lang-switcher { margin-left: 0; margin-right: 0.5rem; }
html[dir="rtl"] .cs-card-gold-border { text-align: right; }
html[dir="rtl"] .cs-step { margin-left: 0; }
html[dir="rtl"] .cs-proof-bar { flex-direction: row-reverse; }
html[dir="rtl"] .cs-movement-links { flex-direction: row-reverse; }
</style>\n  </head>`);
  }

  return baseHtml;
}

// ── Main ──
console.log('========================================');
console.log('🌐 CarShake Localization Engine v2');
console.log(`📂 Source: ${BASE_HTML_PATH}`);
console.log('========================================\n');

const loaded = Object.keys(LANG_MAP).length;
console.log(`📚 Loaded translations for ${loaded} languages\n`);

let count = 0;
let failed = [];

for (const lang of LANGUAGES) {
  const texts = LANG_MAP[lang.code];
  if (!texts) {
    console.log(`  ⚠️  No translations for ${lang.code} (${lang.dirName})`);
    failed.push(lang.code);
    continue;
  }

  const langDir = resolve(DIST, lang.dir);
  if (!existsSync(langDir)) mkdirSync(langDir, { recursive: true });

  try {
    const html = buildLocalizedHtml(lang.code, texts, lang.dir);
    writeFileSync(resolve(langDir, 'index.html'), html, 'utf8');
    count++;
    if (count % 10 === 0 || count === loaded) {
      console.log(`  ✓ ${count}/${LANGUAGES.length} · ${lang.dirName}`);
    }
  } catch (err) {
    console.error(`  ✗ ${lang.code}: ${err.message}`);
    failed.push(lang.code);
  }
}

console.log(`\n✅ GENERATED: ${count}/${LANGUAGES.length} languages`);
if (failed.length > 0) {
  console.log(`⚠️  FAILED: ${failed.length} — ${failed.join(', ')}`);
}
console.log('========================================');
