#!/usr/bin/env node
/**
 * Append remaining 72 language translations to translations-all.mjs
 * Run: node i18n/append-translations.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ALL_PATH = resolve(import.meta.dirname, 'translations-all.mjs');
const OUTPUT_PATH = resolve(import.meta.dirname, 'translations-all.mjs');

// ── Read existing content and strip the closing ──
let content = readFileSync(ALL_PATH, 'utf8');

// Remove the closing "};" and "export { LANG_DATA };"
content = content.replace(/^};?$/m, ',');
content = content.replace(/^export \{ LANG_DATA \};$/m, '');

// ── Remaining languages ──
// Structured as: code, nativeName, isRTL, pageTitle override pattern, enName
const LANGUAGES = [
  ['or', 'Odia', false, 'ଓଡ଼ିଆ'],
  ['pl', 'Polish', false, 'Polski'],
  ['uk', 'Ukrainian', false, 'Українська'],
  ['nl', 'Dutch', false, 'Nederlands'],
  ['ro', 'Romanian', false, 'Română'],
  ['el', 'Greek', false, 'Ελληνικά'],
  ['cs', 'Czech', false, 'Čeština'],
  ['hu', 'Hungarian', false, 'Magyar'],
  ['sv', 'Swedish', false, 'Svenska'],
  ['fi', 'Finnish', false, 'Suomi'],
  ['no', 'Norwegian', false, 'Norsk'],
  ['da', 'Danish', false, 'Dansk'],
  ['he', 'Hebrew', true, 'עברית'],
  ['sw', 'Swahili', false, 'Kiswahili'],
  ['am', 'Amharic', false, 'አማርኛ'],
  ['so', 'Somali', false, 'Soomaali'],
  ['ha', 'Hausa', false, 'Hausa'],
  ['yo', 'Yoruba', false, 'Yorùbá'],
  ['ig', 'Igbo', false, 'Igbo'],
  ['zu', 'Zulu', false, 'isiZulu'],
  ['xh', 'Xhosa', false, 'isiXhosa'],
  ['af', 'Afrikaans', false, 'Afrikaans'],
  ['ms', 'Malay', false, 'Bahasa Melayu'],
  ['my', 'Burmese', false, 'မြန်မာဘာသာ'],
  ['km', 'Khmer', false, 'ភាសាខ្មែរ'],
  ['lo', 'Lao', false, 'ລາວ'],
  ['ne', 'Nepali', false, 'नेपाली'],
  ['si', 'Sinhala', false, 'සිංහල'],
  ['ps', 'Pashto', true, 'پښتو'],
  ['kk', 'Kazakh', false, 'Қазақ'],
  ['uz', 'Uzbek', false, "O'zbek"],
  ['az', 'Azerbaijani', false, 'Azərbaycanca'],
  ['ka', 'Georgian', false, 'ქართული'],
  ['hy', 'Armenian', false, 'Հայերեն'],
  ['mn', 'Mongolian', false, 'Монгол'],
  ['tl', 'Tagalog', false, 'Tagalog'],
  ['ceb', 'Cebuano', false, 'Cebuano'],
  ['jv', 'Javanese', false, 'Basa Jawa'],
  ['su', 'Sundanese', false, 'Basa Sunda'],
  ['hmn', 'Hmong', false, 'Hmoob'],
  ['ku', 'Kurdish', true, 'Kurdî'],
  ['tg', 'Tajik', false, 'Тоҷикӣ'],
  ['tk', 'Turkmen', false, 'Türkmen'],
  ['sq', 'Albanian', false, 'Shqip'],
  ['sr', 'Serbian', false, 'Српски'],
  ['hr', 'Croatian', false, 'Hrvatski'],
  ['bs', 'Bosnian', false, 'Bosanski'],
  ['sk', 'Slovak', false, 'Slovenčina'],
  ['sl', 'Slovenian', false, 'Slovenščina'],
  ['lt', 'Lithuanian', false, 'Lietuvių'],
  ['lv', 'Latvian', false, 'Latviešu'],
  ['et', 'Estonian', false, 'Eesti'],
  ['be', 'Belarusian', false, 'Беларуская'],
  ['bg', 'Bulgarian', false, 'Български'],
  ['mk', 'Macedonian', false, 'Македонски'],
  ['ca', 'Catalan', false, 'Català'],
  ['eu', 'Basque', false, 'Euskara'],
  ['gl', 'Galician', false, 'Galego'],
  ['cy', 'Welsh', false, 'Cymraeg'],
  ['ga', 'Irish', false, 'Gaeilge'],
  ['gd', 'Scottish Gaelic', false, 'Gàidhlig'],
  ['is', 'Icelandic', false, 'Íslenska'],
  ['lb', 'Luxembourgish', false, 'Lëtzebuergesch'],
  ['mt', 'Maltese', false, 'Malti'],
  ['yue', 'Cantonese', false, '粵語'],
  ['ug', 'Uyghur', true, 'ئۇيغۇرچە'],
  ['bo', 'Tibetan', false, 'བོད་སྐད'],
  ['bal', 'Balochi', true, 'بلوچی'],
  ['br', 'Breton', false, 'Brezhoneg'],
  ['ilo', 'Ilocano', false, 'Iloko'],
  ['mad', 'Madurese', false, 'Madhura'],
];

// ── Generate translation object for a language ──
// We'll use a template-based approach with the LLM generating translations
// For each language, we create the complete JavaScript object

async function generateTranslations(code, name, nativeName, isRtl) {
  // Build the prompt for this language
  const prompt = `You are a professional translator for ${name} (${code})${isRtl ? ' — RTL script' : ''}. 
Translate these 65 English strings for CarShake (a car valet damage protection service at carshake.online) into natural, native ${name}.

Return ONLY a JavaScript object literal (no markdown, no explanation) that looks like:
{
  pageTitle: "TRANSLATED",
  pageDesc: "TRANSLATED",
  ...
}

The translations MUST be:
1. Natural and native — not literal/mechanical
2. Culturally appropriate for ${name} speakers
3. All 65 fields present
4. Double-quoted strings, internal quotes escaped with backslash
5. The enName field value is: "${nativeName}"

Here are the English strings to translate (field: English original):
pageTitle: "CarShake — Never Pay for Valet Damage Again. AI Car Scans, Free."
pageDesc: "60-second AI-powered car scan before valet. QR handover proof between you and the attendant. Free — no app download. Used by 1,822+ drivers saving thousands."
navLogo: "CarShake"
navHowItWorks: "How It Works"
navPricing: "Pricing"
navCities: "Cities"
navTryFree: "Try Free"
heroLabel: "The $4,200 Lesson That Built CarShake"
heroTitle1: "Never Pay for Valet Damage "
heroTitleHighlight: "You Didn't Cause"
heroBody: "60-second AI car scan. QR handover proof. Both sides sign. When damage appears, you have irrefutable court-ready evidence. Free — no app download."
heroCTASecondary: "See How It Works"
heroCTAPrimary: "Scan Your Car — Free →"
proofScans: "⭐ 1,822+ scans created"
proofCities: "📍 40+ US cities"
proofVerified: "🔒 SHA-256 verified"
storyQuote: '"I built CarShake because my Ferrari got damaged at valet — and I had zero proof."'
storyP1: "December 2023. I handed my keys to a hotel valet in Beverly Hills. When the car came back, the front splitter was scraped — $4,200 in damage. The valet manager shrugged: \"How do we know it wasn't like that when you dropped it?\""
storyP2: "He was right. I had nothing. No photos. No witness. No proof. I paid for the repair out of pocket."
storyP3: "That's why I built CarShake. I couldn't save my $4,200 — but I can save yours."
oldWayTitle: "❌ The Old Way"
oldWayDesc: "Hand over your keys. Hope nothing happens. If damage appears — argue, fight, pay out of pocket. No proof = no leverage."
newWayTitle: "✅ The CarShake Way"
newWayDesc: "60-second scan captures 8 angles. QR code creates a mutual digital handshake. AI compares before & after. Court-ready evidence."
protocolTitle: "The CarShake 3-Stop Protocol™"
protocolSubtitle: "Three minutes. Three actions. Zero arguments."
stop1Title: "Stop & Scan"
stop1Desc: "Open CarShake. Walk around your car. 8 photos cover every angle. Takes 60 seconds."
stop2Title: "QR Handover Proof"
stop2Desc: "Show the attendant your QR code. They scan it. Both parties digitally confirm the car's condition."
stop3Title: "AI Comparison at Pickup"
stop3Desc: "When you get your car back, scan again. AI compares every angle, flags every new scratch, dent, or scrape."
leadTitle: "Free: The Valet Damage Playbook"
leadDesc: "5 things valet companies don't want you to know. The exact bailment law loopholes that can save you thousands. Plus: CarShake free trial access."
leadPlaceholder: "your@email.com"
leadButton: "Send Me The Free Playbook →"
leadSuccess: "✓ Check your email for the free Valet Damage Playbook"
leadDisclaimer: "No spam. 1 email. Instant download."
testimonialsTitle: "What Early Users Say"
testimonial1: '"Used CarShake before dropping my Tesla at hotel valet. Came back with curb rash on the rear rim. Showed the manager the before scan — they waived the $600 repair. Saved my whole trip."'
testimonial1Author: "— Marcus T., Los Angeles"
testimonial2: '"I valet 3-4 times a week for work. CarShake is my insurance policy. 60 seconds of scanning vs. thousands in potential repairs. No-brainer."'
testimonial2Author: "— Sarah K., New York City"
finalCTATitle: "Don't let valet damage cost you thousands."
finalCTASub: "No app download. 60 seconds. AI-powered. Free."
finalCTAButton: "Scan Your Car — Free →"
topicLabel: "Valet protection guides for every scenario"
topicValetParking: "Valet Parking"
topicHotelParking: "Hotel Parking"
topicAirportParking: "Airport Parking"
topicRentalCars: "Rental Cars"
topicBodyShops: "Body Shops"
topicConcertParking: "Concert Parking"
topicStreetParking: "Street Parking"
topicDealership: "Dealership"
movementTitle: "Join the Movement"
movementText: "We're building a world where no driver pays for damage they didn't cause. Every scan makes parking more accountable."
movementLinkHow: "How It Works"
movementLinkPricing: "Pricing"
movementLinkTrust: "Trust & Security"
movementLinkBlog: "Blog"
movementLinkFAQ: "FAQ"
footerBrand: "CarShake"
footerText: "© 2026 CarShake · carshake.online"
langLabel: "Language"
enName: "${nativeName}"
faqTitle: "Frequently Asked Questions — CarShake"
faqDesc: "Everything you need to know about CarShake: pricing, how scans work, QR handover, legal evidence, and more."
faqH1: "Frequently Asked Questions"
pricingTitle: "CarShake Pricing — Free Valet Protection"
pricingDesc: "Free plan includes 3 scans per month. Shield+ at $2.97/month for unlimited scans, PDF reports, and priority support."
pricingH1: "Simple, Transparent Pricing"
howWorksTitle: "How CarShake Works — AI-Powered Car Protection"
howWorksDesc: "Scan your car in 60 seconds. QR handover proof. AI compares every angle at pickup. Free, no app download needed."
howWorksH1: "How CarShake Works"
trustTitle: "Trust & Security — CarShake"
trustDesc: "SHA-256 hashing, GPS verification, server timestamps. Your car condition data is secure and admissible as evidence."
trustH1: "Trust & Security"

Return ONLY valid JavaScript object literal. Do not include any explanation.`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: `You translate English to ${name}. Return only valid JS object literal.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 4000,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    let translationText = data.choices[0].message.content.trim();
    
    // Strip markdown code fences if present
    translationText = translationText.replace(/^```(?:javascript|js)?\n?/, '').replace(/\n?```$/, '');
    
    // Validate it's parseable
    try {
      const parsed = eval('(' + translationText + ')');
      if (!parsed.pageTitle || !parsed.pageDesc) {
        throw new Error('Missing required fields');
      }
      return translationText;
    } catch (e) {
      console.error(`  ⚠️  ${code}: Validation failed: ${e.message}`);
      // Try to fix common issues
      translationText = translationText.replace(/,\s*}/g, '\n}');
      return translationText;
    }
  } catch (err) {
    console.error(`  ✗ ${code}: ${err.message}`);
    return null;
  }
}

// ── Main ──
console.log(`🌐 Generating translations for ${LANGUAGES.length} remaining languages`);
console.log('');

// Process in batches of 2 to avoid rate limits
const BATCH_SIZE = 2;
let successCount = 0;
let failCount = 0;

for (let i = 0; i < LANGUAGES.length; i += BATCH_SIZE) {
  const batch = LANGUAGES.slice(i, i + BATCH_SIZE);
  const results = await Promise.all(batch.map(([code, name, isRtl, nativeName]) => {
    console.log(`  🔄 Translating ${code} (${name})...`);
    return generateTranslations(code, name, nativeName, isRtl).then(result => ({ code, result }));
  }));

  for (const { code, result } of results) {
    if (result) {
      content += `\n  '${code}': ${result.trim()},\n`;
      successCount++;
      console.log(`  ✓ ${code}`);
    } else {
      failCount++;
      console.log(`  ✗ ${code} failed`);
    }
  }
}

// Close the LANG_DATA object
content += '};\n\nexport { LANG_DATA };\n';

writeFileSync(OUTPUT_PATH, content, 'utf8');
console.log(`\n✅ Done! ${successCount} languages appended, ${failCount} failed`);
console.log(`📁 Final file: ${OUTPUT_PATH}`);
