#!/usr/bin/env node
/**
 * Generate translations using the available API (z.ai/OpenRouter compatible)
 * Run: node i18n/translate-via-api.mjs
 */

const I18N_DIR = new URL('.', import.meta.url).pathname;
const ALL_PATH = I18N_DIR + 'translations-all.mjs';

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const API_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions';

// ── Languages remaining after the top 25 ──
const LANGUAGES = [
  ['or', 'Odia', 'ଓଡ଼ିଆ'],
  ['pl', 'Polish', 'Polski'],
  ['uk', 'Ukrainian', 'Українська'],
  ['nl', 'Dutch', 'Nederlands'],
  ['ro', 'Romanian', 'Română'],
  ['el', 'Greek', 'Ελληνικά'],
  ['cs', 'Czech', 'Čeština'],
  ['hu', 'Hungarian', 'Magyar'],
  ['sv', 'Swedish', 'Svenska'],
  ['fi', 'Finnish', 'Suomi'],
  ['no', 'Norwegian', 'Norsk'],
  ['da', 'Danish', 'Dansk'],
  ['he', 'Hebrew', 'עברית'],
  ['sw', 'Swahili', 'Kiswahili'],
  ['am', 'Amharic', 'አማርኛ'],
  ['so', 'Somali', 'Soomaali'],
  ['ha', 'Hausa', 'Hausa'],
  ['yo', 'Yoruba', 'Yorùbá'],
  ['ig', 'Igbo', 'Igbo'],
  ['zu', 'Zulu', 'isiZulu'],
  ['xh', 'Xhosa', 'isiXhosa'],
  ['af', 'Afrikaans', 'Afrikaans'],
  ['ms', 'Malay', 'Bahasa Melayu'],
  ['my', 'Burmese', 'မြန်မာဘာသာ'],
  ['km', 'Khmer', 'ភាសាខ្មែរ'],
  ['lo', 'Lao', 'ລາວ'],
  ['ne', 'Nepali', 'नेपाली'],
  ['si', 'Sinhala', 'සිංහල'],
  ['ps', 'Pashto', 'پښتو'],
  ['kk', 'Kazakh', 'Қазақ'],
  ['uz', 'Uzbek', "O'zbek"],
  ['az', 'Azerbaijani', 'Azərbaycanca'],
  ['ka', 'Georgian', 'ქართული'],
  ['hy', 'Armenian', 'Հայերեն'],
  ['mn', 'Mongolian', 'Монгол'],
  ['tl', 'Tagalog', 'Tagalog'],
  ['ceb', 'Cebuano', 'Cebuano'],
  ['jv', 'Javanese', 'Basa Jawa'],
  ['su', 'Sundanese', 'Basa Sunda'],
  ['hmn', 'Hmong', 'Hmoob'],
  ['ku', 'Kurdish', 'Kurdî'],
  ['tg', 'Tajik', 'Тоҷикӣ'],
  ['tk', 'Turkmen', 'Türkmen'],
  ['sq', 'Albanian', 'Shqip'],
  ['sr', 'Serbian', 'Српски'],
  ['hr', 'Croatian', 'Hrvatski'],
  ['bs', 'Bosnian', 'Bosanski'],
  ['sk', 'Slovak', 'Slovenčina'],
  ['sl', 'Slovenian', 'Slovenščina'],
  ['lt', 'Lithuanian', 'Lietuvių'],
  ['lv', 'Latvian', 'Latviešu'],
  ['et', 'Estonian', 'Eesti'],
  ['be', 'Belarusian', 'Беларуская'],
  ['bg', 'Bulgarian', 'Български'],
  ['mk', 'Macedonian', 'Македонски'],
  ['ca', 'Catalan', 'Català'],
  ['eu', 'Basque', 'Euskara'],
  ['gl', 'Galician', 'Galego'],
  ['cy', 'Welsh', 'Cymraeg'],
  ['ga', 'Irish', 'Gaeilge'],
  ['gd', 'Scottish Gaelic', 'Gàidhlig'],
  ['is', 'Icelandic', 'Íslenska'],
  ['lb', 'Luxembourgish', 'Lëtzebuergesch'],
  ['mt', 'Maltese', 'Malti'],
  ['yue', 'Cantonese', '粵語'],
  ['ug', 'Uyghur', 'ئۇيغۇرچە'],
  ['bo', 'Tibetan', 'བོད་སྐད'],
  ['bal', 'Balochi', 'بلوچی'],
  ['br', 'Breton', 'Brezhoneg'],
  ['ilo', 'Ilocano', 'Iloko'],
  ['mad', 'Madurese', 'Madhura'],
];

// ── Read existing content ──
let content = '';
if (existsSync(ALL_PATH)) {
  content = readFileSync(ALL_PATH, 'utf8');
  // Remove the closing portion
  content = content.replace(/^};$/m, ',');
  content = content.replace(/\nexport \{ LANG_DATA \};\n?$/, '');
}

// English source strings
function getEnglishSource() {
  return {
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
    enName: "",
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
}

// ── API call ──
async function translateLanguage(code, name, nativeName) {
  const en = getEnglishSource();
  en.enName = nativeName;

  const fields = Object.entries(en)
    .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
    .join(',\n');

  const prompt = `You are a professional translator. Translate the following English text for a car valet damage protection service called "CarShake" at carshake.online into ${name} (language code: ${code}). The native name of the language is "${nativeName}".

Return a VALID JavaScript object literal ONLY (no explanation, no markdown, just the object). Each property name must match exactly. Strings in double quotes. Escape internal double quotes. Do NOT translate the brand name "CarShake" in navLogo and footerBrand.

The ${name} translations must be natural and native — not literal translations. Use culturally appropriate phrasing for ${name} speakers.

Here are the English field:value pairs to translate:
${fields}

Return ONLY the JavaScript object literal:`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'glm-5.2',
        messages: [
          { role: 'system', content: `You translate English to ${name}. Return only a valid JavaScript object literal with double-quoted strings. No markdown. No explanation.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`  ✗ ${code} (${name}): API error ${response.status}`);
      console.error(`    ${err.substring(0, 200)}`);
      return null;
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content?.trim() || '';
    
    // Remove markdown code fences
    text = text.replace(/^```(?:javascript|js)?\n?/i, '').replace(/\n?```$/i, '').trim();
    
    // Basic validation
    if (!text.includes('pageTitle') || !text.includes('pageDesc')) {
      console.error(`  ✗ ${code}: Invalid response (missing key fields)`);
      return null;
    }

    return text;
  } catch (err) {
    console.error(`  ✗ ${code}: ${err.message}`);
    return null;
  }
}

// ── Main ──
console.log(`🌐 API Translation Generator`);
console.log(`========================`);
console.log(`Languages to translate: ${LANGUAGES.length}`);
console.log(`API: ${API_URL}`);
console.log('');

let success = 0;
let failed = 0;

// Process in batches of 3 to avoid overwhelming the API but maximizing throughput
for (let i = 0; i < LANGUAGES.length; i += 3) {
  const batch = LANGUAGES.slice(i, i + 3);
  console.log(`\n--- Batch ${Math.floor(i/3) + 1}/${Math.ceil(LANGUAGES.length/3)} ---`);
  
  const results = await Promise.all(batch.map(([code, name, nativeName]) => {
    console.log(`  → ${code} (${name})`);
    return translateLanguage(code, name, nativeName);
  }));

  for (let j = 0; j < results.length; j++) {
    const result = results[j];
    const [code, name, nativeName] = batch[j];
    
    if (result) {
      content += `\n  '${code}': ${result.trim()},\n`;
      success++;
      console.log(`  ✓ ${code} (${name})`);
    } else {
      failed++;
      console.log(`  ✗ ${code} (${name}) — failed`);
    }
  }
}

// Close the object and add export
content += '};\n\nexport { LANG_DATA };\n';

writeFileSync(ALL_PATH, content, 'utf8');

console.log(`\n========================`);
console.log(`✅ Done! ${success} translated, ${failed} failed`);
console.log(`📁 File: ${ALL_PATH}`);
