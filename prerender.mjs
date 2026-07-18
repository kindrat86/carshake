#!/usr/bin/env node
/**
 * CarShake SEO Prerender Script — Design System v2
 * 
 * Uses centralized CSS design-system.css for consistent,
 * mobile-first, world-class UI/UX across all 100+ pages.
 * Generates static HTML for crawlers with full content,
 * meta tags, JSON-LD, and Brunson story-selling frameworks.
 * 
 * Run: node prerender.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const DIST = resolve(import.meta.dirname, '.');
var SITE = 'https://carshake.online';

// ── Compare page definitions ──────────────────────────────────────
const COMPARE_CATEGORIES = [
  {
    name: 'Camera Apps (Photos)',
    whatTheySay: 'Just take photos before parking. Your phone gallery is enough.',
    whatTheyMiss: 'Photos in your gallery have no GPS timestamp, no verification chain, no mutual confirmation, and no AI comparison. A photo proves nothing about when it was taken or whether damage was pre-existing.',
    verdict: 'CarShake creates an unbroken chain of custody: GPS-verified, server-timestamped, SHA-256 hashed, mutually confirmed by both parties via QR handshake. Your camera roll can\'t do any of that.'
  },
  {
    name: 'Valet Insurance through Your Carrier',
    whatTheySay: 'Your comprehensive auto insurance covers valet damage. Just file a claim.',
    whatTheyMiss: 'Filing a claim means paying your deductible ($500-$1,000), risk of premium increases, and zero leverage if the valet company disputes responsibility. Without proof of pre-existing condition, you lose.',
    verdict: 'CarShake isn\'t insurance — it\'s evidence. 60 seconds of documentation prevents disputes entirely. Most valet companies settle immediately when shown irrefutable before/after proof.'
  },
  {
    name: 'Dash Cams',
    whatTheySay: 'A dash cam records everything while you\'re parked.',
    whatTheyMiss: 'Dash cams only capture what happens IN front of the car. They miss door dings, parking lot bumps, and damage to sides and rear. Many don\'t work when the engine is off, and none provide mutual QR handshake confirmation.',
    verdict: 'CarShake covers 8 angles with your phone in 60 seconds — including sides, rear, roof clearance, and mirrors. Far more comprehensive than a single dash cam lens.'
  },
  {
    name: 'DIY Walk-Around Videos',
    whatTheySay: 'Record a video walk-around before parking. That\'s free.',
    whatTheyMiss: 'A video on your phone proves nothing — no timestamp verification, no GPS validation, no mutual confirmation from the attendant, and no structured comparison when you return. The valet will say any damage was there before.',
    verdict: 'CarShake\'s QR handshake gets the ATTENDANT to confirm your car\'s condition. That mutual digital agreement is what changes disputes — not a one-sided video.'
  },
  {
    name: 'Dealer/Valet Provided Inspections',
    whatTheySay: 'The valet company does their own inspection. Trust their process.',
    whatTheyMiss: 'The valet company\'s inspection is designed to protect THEM, not you. They document damage they see — not damage they missed. And you never get a copy of their report unless there\'s a dispute.',
    verdict: 'CarShake puts YOU in control. You create and own the evidence. The attendant confirms it. Both sides have a copy. No conflict of interest.'
  },
  {
    name: 'Nothing (Hope for the Best)',
    whatTheySay: 'I\'ve been parking with valet for years and never had a problem.',
    whatTheyMiss: 'Valet damage costs American drivers $2 billion annually. The 1-in-20 odds of damage in a given year mean you\'re statistically due within 5 years of regular valet use. The average repair is $850+.',
    verdict: 'CarShake is free for 3 scans per month. That\'s $0 for the only tool that gives you court-ready evidence. The alternative is paying $850+ out of pocket.'
  },
];

// ── Load the base HTML template ──────────────────────────────────
let baseHtml = readFileSync(resolve(DIST, 'index.html'), 'utf8');

// ── Helper: inject meta and body into index.html ─────────────────
function injectMetaBody(baseHtml, { title, description, canonical, ogTitle, ogDesc, jsonLd, bodyHtml }) {
  let html = baseHtml;

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta name="description"[^>]*\/?>/,
    `<meta name="description" content="${escapeHtml(description)}">`
  );

  // Replace OG title
  html = html.replace(
    /<meta property="og:title"[^>]*\/?>/,
    `<meta property="og:title" content="${escapeHtml(ogTitle || title)}">`
  );
  html = html.replace(
    /<meta name="twitter:title"[^>]*\/?>/,
    `<meta name="twitter:title" content="${escapeHtml(ogTitle || title)}">`
  );

  // Replace OG description
  html = html.replace(
    /<meta property="og:description"[^>]*\/?>/,
    `<meta property="og:description" content="${escapeHtml(ogDesc || description)}">`
  );
  html = html.replace(
    /<meta name="twitter:description"[^>]*\/?>/,
    `<meta name="twitter:description" content="${escapeHtml(ogDesc || description)}">`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical"[^>]*\/?>/,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`
  );

  // Replace OG url
  html = html.replace(
    /<meta property="og:url"[^>]*\/?>/,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`
  );

  // Inject JSON-LD
  if (jsonLd) {
    html = html.replace(
      /<\/head>/,
      `<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>\n</head>`
    );
  }

  // Replace the #root element with this page's body, always emitting a balanced,
  // properly-closed root. The old approach matched /<div id="root">…<\/div>\s*<\/body>/
  // — it assumed root's closing </div> sat directly before </body>. Once an AEO block
  // was baked into index.html between root's close and </body>, that regex stopped
  // matching (silent no-op → pages shipped without their body), and earlier runs left
  // <div id="root"> unclosed on 255 pages. We instead locate root's matching </div> by
  // depth-counting and rebuild the whole element, so nesting is always correct and any
  // trailing content (AEO block, JSON-LD, </body>) is preserved verbatim.
  const rootStart = html.indexOf('<div id="root">');
  if (rootStart !== -1) {
    const scan = /<div\b|<\/div>/g;
    scan.lastIndex = rootStart + '<div id="root">'.length;
    let depth = 1, rootEnd = -1, m;
    while ((m = scan.exec(html)) !== null) {
      if (m[0] === '</div>') { if (--depth === 0) { rootEnd = scan.lastIndex; break; } }
      else depth++;
    }
    if (rootEnd !== -1) {
      // Auto-inject TL;DR after first <h1> for AEO scoring (E4). Skip if page already has one.
      let bodyWithTLDR = bodyHtml.trim();
      if (description && !/<p[^>]*class="[^"]*tldr[^"]*"/i.test(bodyWithTLDR) && !/TL;DR/i.test(bodyWithTLDR)) {
        const tldrHtml = `<p class="tldr cs-body-sm" style="background:var(--cs-card-bg);border-left:3px solid var(--cs-gold);padding:var(--cs-space-3);margin:0 0 var(--cs-space-4);border-radius:0 var(--cs-radius) var(--cs-radius) 0;font-style:italic"><strong>TL;DR:</strong> ${escapeHtml(description)}</p>`;
        bodyWithTLDR = bodyWithTLDR.replace(/(<h1[^>]*>[^<]*<\/h1>)/i, `$1\n${tldrHtml}`);
      }
      const rootEl = `<div id="root">\n      <div class="cs-page">\n        ${bodyWithTLDR}\n      </div>\n    </div>`;
      html = html.slice(0, rootStart) + rootEl + html.slice(rootEnd);
    }
  }

  return html;
}

// ── Helpers ──────────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncate(text, maxLen) {
  if (!text || text.length <= maxLen) return text;
  const cut = text.lastIndexOf(' ', maxLen - 1);
  return text.substring(0, cut > 40 ? cut : maxLen - 3).trim() + '...';
}

function slugToDisplay(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── Data ─────────────────────────────────────────────────────────

const CITIES = {
  'new-york': { state: 'New York', population: '8.4M', parkingNotable: 'over 10,000 valet parking spots across Manhattan alone, with some of the highest parking rates in the country' },
  'los-angeles': { state: 'California', population: '3.8M', parkingNotable: 'one of the most car-dependent cities with extensive valet services at restaurants, hotels, and entertainment venues' },
  'chicago': { state: 'Illinois', population: '2.7M', parkingNotable: 'a major valet hub with thousands of parking garages and hotel valet services across the city' },
  'houston': { state: 'Texas', population: '2.3M', parkingNotable: 'sprawling city with high car ownership and extensive valet parking at restaurants and event venues' },
  'phoenix': { state: 'Arizona', population: '1.6M', parkingNotable: 'growing downtown area with increasing valet services at resorts, hotels, and entertainment districts' },
  'san-francisco': { state: 'California', population: '815K', parkingNotable: 'notorious for car break-ins and parking damage, making pre-parking documentation essential' },
  'miami': { state: 'Florida', population: '470K', parkingNotable: 'high-density valet scene at South Beach hotels, nightclubs, and restaurants with significant parking risk' },
  'las-vegas': { state: 'Nevada', population: '650K', parkingNotable: 'the valet capital of America with every casino, hotel, and restaurant offering valet parking' },
  'dallas': { state: 'Texas', population: '1.3M', parkingNotable: 'major business and entertainment district with high-volume valet operations' },
  'san-diego': { state: 'California', population: '1.4M', parkingNotable: 'heavy tourism and convention traffic with extensive hotel and restaurant valet services' },
  'boston': { state: 'Massachusetts', population: '675K', parkingNotable: 'tight parking spaces and narrow streets make parking damage especially common' },
  'seattle': { state: 'Washington', population: '755K', parkingNotable: 'growing downtown with increasing valet services at hotels and restaurants' },
  'denver': { state: 'Colorado', population: '715K', parkingNotable: 'major convention and sports event destination with high valet demand' },
  'atlanta': { state: 'Georgia', population: '510K', parkingNotable: 'Buckhead and Midtown areas have dense valet coverage at restaurants and hotels' },
  'washington-dc': { state: 'District of Columbia', population: '690K', parkingNotable: 'high concentration of hotel valet services with limited street parking' },
  'nashville': { state: 'Tennessee', population: '690K', parkingNotable: 'explosive tourism growth with heavy valet traffic on Broadway and downtown' },
  'austin': { state: 'Texas', population: '965K', parkingNotable: 'SXSW and F1 events create massive valet demand throughout the year' },
  'portland': { state: 'Oregon', population: '640K', parkingNotable: 'compact downtown with high usage of hotel and restaurant valet services' },
  'orlando': { state: 'Florida', population: '310K', parkingNotable: 'theme park central with enormous parking structures and hotel valet operations' },
  'philadelphia': { state: 'Pennsylvania', population: '1.6M', parkingNotable: 'dense urban core with limited parking and extensive valet services at restaurants and hotels' },
  'charlotte': { state: 'North Carolina', population: '875K', parkingNotable: 'rapidly growing city with increasing downtown valet parking infrastructure' },
  'detroit': { state: 'Michigan', population: '670K', parkingNotable: 'Motor City with high car ownership and casino/hotel valet services throughout downtown' },
  'minneapolis': { state: 'Minnesota', population: '430K', parkingNotable: 'skyway system areas and downtown hotels have heavy valet usage during winter months' },
  'san-antonio': { state: 'Texas', population: '1.5M', parkingNotable: 'Riverwalk area and downtown hotels generate high valet parking demand' },
  'sacramento': { state: 'California', population: '525K', parkingNotable: 'growing downtown with increasing restaurant and event valet services' },
  'tampa': { state: 'Florida', population: '390K', parkingNotable: 'waterfront hotels and Ybor City entertainment district have extensive valet operations' },
  'pittsburgh': { state: 'Pennsylvania', population: '300K', parkingNotable: 'hilly terrain and narrow streets make parking damage more likely, requiring documentation' },
  'baltimore': { state: 'Maryland', population: '585K', parkingNotable: 'Inner Harbor hotels and Fells Point restaurants have high valet traffic' },
  'indianapolis': { state: 'Indiana', population: '880K', parkingNotable: 'Indy 500 and major convention events drive heavy valet demand year-round' },
  'kansas-city': { state: 'Missouri', population: '510K', parkingNotable: 'Power & Light District and downtown hotels generate significant valet parking activity' },
  'columbus': { state: 'Ohio', population: '905K', parkingNotable: 'OSU events and Arena District create high valet demand on game days and weekends' },
  'milwaukee': { state: 'Wisconsin', population: '570K', parkingNotable: 'Summerfest and downtown entertainment districts drive significant valet parking usage' },
  'cleveland': { state: 'Ohio', population: '370K', parkingNotable: 'Rock & Roll Hall of Fame, sporting events, and downtown hotels all rely on valet services' },
  'salt-lake-city': { state: 'Utah', population: '200K', parkingNotable: 'growing downtown and ski tourism drive hotel valet parking demand' },
  'raleigh': { state: 'North Carolina', population: '470K', parkingNotable: 'Research Triangle area with increasing downtown restaurant and event valet services' },
  'memphis': { state: 'Tennessee', population: '630K', parkingNotable: 'Beale Street and downtown hotels have significant valet parking operations' },
  'richmond': { state: 'Virginia', population: '230K', parkingNotable: 'growing food scene and downtown revitalization driving more valet services' },
  'new-orleans': { state: 'Louisiana', population: '380K', parkingNotable: 'French Quarter hotels and restaurants have dense valet coverage with limited street parking' },
  'honolulu': { state: 'Hawaii', population: '345K', parkingNotable: 'Waikiki hotels and resort areas have extensive valet parking services for tourists' },
  'anchorage': { state: 'Alaska', population: '290K', parkingNotable: 'extreme winter conditions make parking damage documentation especially valuable' },
};

const CITIES_LIST = [
  { slug: 'new-york', display: 'New York City', state: 'NY' },
  { slug: 'los-angeles', display: 'Los Angeles', state: 'CA' },
  { slug: 'chicago', display: 'Chicago', state: 'IL' },
  { slug: 'houston', display: 'Houston', state: 'TX' },
  { slug: 'phoenix', display: 'Phoenix', state: 'AZ' },
  { slug: 'san-francisco', display: 'San Francisco', state: 'CA' },
  { slug: 'miami', display: 'Miami', state: 'FL' },
  { slug: 'las-vegas', display: 'Las Vegas', state: 'NV' },
  { slug: 'dallas', display: 'Dallas', state: 'TX' },
  { slug: 'san-diego', display: 'San Diego', state: 'CA' },
  { slug: 'boston', display: 'Boston', state: 'MA' },
  { slug: 'seattle', display: 'Seattle', state: 'WA' },
  { slug: 'denver', display: 'Denver', state: 'CO' },
  { slug: 'atlanta', display: 'Atlanta', state: 'GA' },
  { slug: 'washington-dc', display: 'Washington DC', state: 'DC' },
  { slug: 'nashville', display: 'Nashville', state: 'TN' },
  { slug: 'austin', display: 'Austin', state: 'TX' },
  { slug: 'portland', display: 'Portland', state: 'OR' },
  { slug: 'orlando', display: 'Orlando', state: 'FL' },
  { slug: 'philadelphia', display: 'Philadelphia', state: 'PA' },
  { slug: 'charlotte', display: 'Charlotte', state: 'NC' },
  { slug: 'detroit', display: 'Detroit', state: 'MI' },
  { slug: 'minneapolis', display: 'Minneapolis', state: 'MN' },
  { slug: 'san-antonio', display: 'San Antonio', state: 'TX' },
  { slug: 'sacramento', display: 'Sacramento', state: 'CA' },
  { slug: 'tampa', display: 'Tampa', state: 'FL' },
  { slug: 'pittsburgh', display: 'Pittsburgh', state: 'PA' },
  { slug: 'baltimore', display: 'Baltimore', state: 'MD' },
  { slug: 'indianapolis', display: 'Indianapolis', state: 'IN' },
  { slug: 'kansas-city', display: 'Kansas City', state: 'MO' },
  { slug: 'columbus', display: 'Columbus', state: 'OH' },
  { slug: 'milwaukee', display: 'Milwaukee', state: 'WI' },
  { slug: 'cleveland', display: 'Cleveland', state: 'OH' },
  { slug: 'salt-lake-city', display: 'Salt Lake City', state: 'UT' },
  { slug: 'raleigh', display: 'Raleigh', state: 'NC' },
  { slug: 'memphis', display: 'Memphis', state: 'TN' },
  { slug: 'richmond', display: 'Richmond', state: 'VA' },
  { slug: 'new-orleans', display: 'New Orleans', state: 'LA' },
  { slug: 'honolulu', display: 'Honolulu', state: 'HI' },
  { slug: 'anchorage', display: 'Anchorage', state: 'AK' },
];

const STATES = {
  'california': { name: 'California', bailmentLaw: 'California Civil Code §2110-2128 (gratuitous bailment) and §1851-1864 (bailment for hire)', statuteOfLimitations: '3 years for breach of bailment (CCP §338)', notableCase: 'Strong bailment protections; valet parking is considered a bailment for hire, placing duty of reasonable care on the parking operator.' },
  'texas': { name: 'Texas', bailmentLaw: 'Texas common law bailment principles (no specific statute)', statuteOfLimitations: '2 years for property damage (Civil Practice & Remedies Code §16.003)', notableCase: 'Texas courts generally find valet parking creates a bailment relationship, requiring operators to exercise ordinary care.' },
  'new-york': { name: 'New York', bailmentLaw: 'New York General Obligations Law §5-325 (parking lot liability waivers)', statuteOfLimitations: '3 years for property damage (CPLR §214)', notableCase: 'Parking garages and valet services owe a duty of reasonable care; disclaimers do not relieve negligence liability.' },
  'florida': { name: 'Florida', bailmentLaw: 'Florida common law bailment (based on control and possession)', statuteOfLimitations: '4 years for property damage (FS §95.11(3))', notableCase: 'Valet parking constitutes a bailment; parking receipts often contain disclaimers but gross negligence cannot be disclaimed.' },
  'illinois': { name: 'Illinois', bailmentLaw: 'Illinois common law bailment principles', statuteOfLimitations: '5 years for property damage (735 ILCS 5/13-205)', notableCase: 'Parking lot operators owe a duty of ordinary care to bailor (the car owner). Ticket disclaimers are generally valid but strictly construed.' },
  'nevada': { name: 'Nevada', bailmentLaw: 'NRS §645B.010-140 (parking lot regulations)', statuteOfLimitations: '3 years for property damage (NRS §11.190)', notableCase: 'Las Vegas valet operations are common bailment relationships; casinos often post specific liability limits on parking tickets.' },
  'massachusetts': { name: 'Massachusetts', bailmentLaw: 'Massachusetts General Laws Ch. 231, §85N (parking lot liability)', statuteOfLimitations: '3 years for property damage (MGL Ch. 260, §2A)', notableCase: 'Strict notice requirements; parking lot operators must post liability limits conspicuously to limit recovery.' },
  'pennsylvania': { name: 'Pennsylvania', bailmentLaw: 'Pennsylvania common law bailment (possession and control test)', statuteOfLimitations: '2 years for property damage (42 Pa.C.S. §5524)', notableCase: 'Valet parking is considered a mutual benefit bailment, requiring ordinary diligence from the bailee (parking operator).' },
  'ohio': { name: 'Ohio', bailmentLaw: 'Ohio Revised Code §4513.60 (parking facility regulations)', statuteOfLimitations: '2 years for property damage (ORC §2305.10)', notableCase: 'Ohio recognizes bailment in valet scenarios; parking receipts may limit liability to specific amounts if conspicuously posted.' },
  'georgia': { name: 'Georgia', bailmentLaw: 'Georgia Code §44-12-40 to 44-12-43 (bailment generally)', statuteOfLimitations: '4 years for property damage (OCGA §9-3-31)', notableCase: 'Valet parking is a bailment requiring ordinary care; exculpatory clauses are valid but strictly construed.' },
  'michigan': { name: 'Michigan', bailmentLaw: 'Michigan common law bailment principles', statuteOfLimitations: '3 years for property damage (MCL §600.5805)', notableCase: 'Parking lot and valet services create a bailment relationship; the bailee must exercise reasonable care under the circumstances.' },
  'new-jersey': { name: 'New Jersey', bailmentLaw: 'New Jersey common law bailment (control-based test)', statuteOfLimitations: '6 years for property damage (NJSA §2A:14-1)', notableCase: 'New Jersey courts recognize valet parking as a bailment for mutual benefit, requiring reasonable care from the valet operator.' },
  'arizona': { name: 'Arizona', bailmentLaw: 'Arizona common law bailment principles', statuteOfLimitations: '2 years for property damage (ARS §12-542)', notableCase: 'Arizona follows general bailment principles; valet parking constitutes a bailment where the owner must exercise ordinary care.' },
  'colorado': { name: 'Colorado', bailmentLaw: 'Colorado common law bailment (possession test)', statuteOfLimitations: '3 years for property damage (CRS §13-80-101)', notableCase: 'Colorado courts apply standard bailment analysis; key issue is whether the valet took exclusive possession and control of the vehicle.' },
  'north-carolina': { name: 'North Carolina', bailmentLaw: 'North Carolina common law bailment principles', statuteOfLimitations: '3 years for property damage (NCGS §1-52)', notableCase: 'Valet parking creates a bailment relationship; the standard of care depends on whether the bailment is gratuitous or for hire.' },
  'tennessee': { name: 'Tennessee', bailmentLaw: 'Tennessee common law bailment (control-based)', statuteOfLimitations: '3 years for property damage (TCA §28-3-105)', notableCase: 'Tennessee follows traditional bailment law; parking receipts with liability limits are generally enforced if prominently displayed.' },
  'virginia': { name: 'Virginia', bailmentLaw: 'Virginia common law bailment (possession and control)', statuteOfLimitations: '5 years for property damage (VA Code §8.01-243)', notableCase: 'Virginia recognizes bailment in valet parking scenarios; contributory negligence can bar recovery entirely.' },
  'washington': { name: 'Washington', bailmentLaw: 'Washington common law bailment principles (RCW Titles linked)', statuteOfLimitations: '3 years for property damage (RCW §4.16.080)', notableCase: 'Washington courts treat valet parking as a bailment for hire, requiring reasonable care and full disclosure of any liability limits.' },
  'oregon': { name: 'Oregon', bailmentLaw: 'Oregon common law bailment (ORS §72.1010-72.7250 extends to bailments)', statuteOfLimitations: '6 years for property damage (ORS §12.080)', notableCase: 'Oregon applies general bailment law; parking operators must exercise ordinary care and cannot disclaim gross negligence.' },
  'maryland': { name: 'Maryland', bailmentLaw: 'Maryland common law bailment principles', statuteOfLimitations: '3 years for property damage (MD Code, Courts & Judicial Proceedings §5-101)', notableCase: 'Maryland courts recognize bailment in commercial parking; the burden of proof shifts to the bailee to show damage was not caused by negligence.' },
  'wisconsin': { name: 'Wisconsin', bailmentLaw: 'Wisconsin common law bailment (posession and control test)', statuteOfLimitations: '6 years for property damage (WS §893.52)', notableCase: 'Wisconsin follows traditional bailment law; valet parking creates a bailment for mutual benefit with ordinary care standard.' },
  'missouri': { name: 'Missouri', bailmentLaw: 'Missouri common law bailment principles', statuteOfLimitations: '5 years for property damage (RSMo §516.120)', notableCase: 'Missouri recognizes bailment in valet scenarios; exclusive possession and control are the key elements courts examine.' },
  'indiana': { name: 'Indiana', bailmentLaw: 'Indiana common law bailment (possession-based)', statuteOfLimitations: '2 years for property damage (IC §34-11-2-4)', notableCase: 'Indiana courts apply the three-prong bailment test: delivery, acceptance, and agreement that bailee will return the property.' },
  'minnesota': { name: 'Minnesota', bailmentLaw: 'Minnesota common law bailment principles', statuteOfLimitations: '6 years for property damage (MS §541.05)', notableCase: 'Minnesota treats valet parking as a bailment; the bailee must exercise the degree of care that a reasonably prudent person would under the circumstances.' },
  'connecticut': { name: 'Connecticut', bailmentLaw: 'Connecticut common law bailment (CGS §42a-2-503)', statuteOfLimitations: '6 years for property damage (CGS §52-577)', notableCase: 'Connecticut courts find bailment relationships in commercial parking scenarios; parking lot operators must exercise reasonable care.' },
  'louisiana': { name: 'Louisiana', bailmentLaw: 'Louisiana Civil Code Art. 2926-2937 (bailment/loan for use)', statuteOfLimitations: '1 year for property damage (CC Art. 3492)', notableCase: 'Louisiana civil law system treats valet parking under deposit/lease principles; stricter notice requirements for liability disclaimers.' },
  'hawaii': { name: 'Hawaii', bailmentLaw: 'Hawaii common law bailment principles', statuteOfLimitations: '2 years for property damage (HRS §657-7)', notableCase: 'Hawaii follows traditional bailment analysis; tourism-heavy valet industry means many disputes arise from rental and hotel parking scenarios.' },
  'alaska': { name: 'Alaska', bailmentLaw: 'Alaska common law bailment (possession-based)', statuteOfLimitations: '3 years for property damage (AS §09.10.050)', notableCase: 'Alaska courts apply standard bailment law; extreme weather conditions often play a role in parking damage disputes.' },
  'dc': { name: 'Washington, DC', bailmentLaw: 'DC common law bailment principles', statuteOfLimitations: '3 years for property damage (DC Code §12-301)', notableCase: 'DC recognizes bailment in valet parking; high-density commercial district leads to frequent parking damage disputes.' },
};

const USE_CASES = {
  'valet-parking': { h1: 'Protect Your Car at Valet Parking', title: 'Protect Your Car at Valet Parking — CarShake', metaDescription: 'AI-verified car condition scans before & after valet. QR handover proof. Never pay for damage you didn\'t cause.', paragraphs: ['Every time you hand your keys to a valet, you\'re trusting a stranger with one of your most expensive possessions. Without documented proof of your car\'s condition before handover, you have no defense when damage appears at pickup.', 'CarShake creates a signed, timestamped, AI-verified record in 60 seconds. The attendant scans your QR code and confirms your car\'s condition. Both sides sign. Both sides are protected. When you return, AI compares every angle instantly.', 'Under bailment law, the valet has a duty of care for your vehicle. But proving when damage occurred is nearly impossible without structured evidence. CarShake gives you GPS-verified photos, mutual digital confirmation, and AI comparison — the complete evidence package that changes every dispute.'] },
  'airport-parking': { h1: 'Protect Your Car at Airport Parking', title: 'Protect Your Car at Airport Parking — CarShake', metaDescription: 'Document your car before long-term airport parking. AI comparison at pickup catches every scratch.', paragraphs: ['Airport parking is one of the highest-risk situations for vehicle damage. Your car sits for days or weeks, surrounded by other vehicles, shuttle buses, and luggage carts. When you return exhausted from travel, you\'re unlikely to notice subtle damage.', 'CarShake lets you scan your car in 60 seconds before heading to the terminal. When you return — even weeks later — scan again and AI compares every angle. New scratches, dents, or curb rash are flagged instantly with exact location and severity.', 'Long-term parking lots are especially problematic because damage accumulates over time and tracking responsibility becomes nearly impossible. With CarShake, you have timestamped proof of your car\'s exact condition at drop-off and pickup.'] },
  'hotel-parking': { h1: 'Protect Your Car at Hotel Parking', title: 'Protect Your Car at Hotel Parking — CarShake', metaDescription: 'Signed evidence for hotel valet and garage parking. Both sides confirm via QR code.', paragraphs: ['Hotel valet parking combines two risk factors: your car is handled by multiple attendants over multiple days, and the hotel\'s liability disclaimer is prominently printed on every ticket.', 'CarShake creates mutual accountability. When the valet takes your keys, they scan your QR code and confirm your car\'s condition. This digital handshake protects both sides — the hotel from false claims, and you from real damage.', 'Whether you\'re staying one night or one week, every time your car is moved by hotel staff, you can create a new scan pair. Build a complete record of your vehicle\'s condition throughout your stay.'] },
  'body-shop': { h1: 'Protect Your Car at the Body Shop', title: 'Protect Your Car at the Body Shop — CarShake', metaDescription: 'Document condition before and after mechanic visits. AI spots every difference.', paragraphs: ['Taking your car to a body shop or mechanic should fix problems, not create new ones. But without documented proof of your car\'s condition before the visit, new damage can easily be attributed to pre-existing conditions.', 'Scan your car before dropping it off at the shop. When you pick it up, scan again. CarShake\'s AI compares every angle and flags any changes — including areas that weren\'t part of the original repair.', 'Body shops handle dozens of vehicles in tight spaces. Accidental bumps, paint overspray, and tool marks happen. With CarShake, you have irrefutable evidence if your car comes back with more issues than it went in with.'] },
  'car-rental': { h1: 'Protect Your Rental Car', title: 'Protect Your Rental Car — CarShake', metaDescription: 'Avoid false damage charges at rental car return. Timestamped, GPS-verified photos.', paragraphs: ['Rental car damage disputes are one of the most common travel complaints. Rental companies inspect returned vehicles and charge for damage — sometimes damage that was already present when you picked up the car.', 'Before driving off the lot, scan the rental with CarShake. Capture all 8 angles in 60 seconds. When you return the car, scan again. If the rental company claims new damage, you have AI-verified proof of the car\'s condition at both points.', 'The rental counter walk-around is often rushed, and the condition report may miss existing scratches and dents. CarShake gives you comprehensive, timestamped documentation that protects you from unfair charges.'] },
  'car-wash': { h1: 'Protect Your Car at the Car Wash', title: 'Protect Your Car at the Car Wash — CarShake', metaDescription: 'Document condition before automated or hand wash. 60-second scan, court-ready evidence.', paragraphs: ['Car washes — especially automated tunnel washes — can cause swirl marks, scratches, and damage to antennas, mirrors, and trim pieces. The damage is often subtle and only visible in certain lighting.', 'Scan your car before entering the wash. After, scan again from the same angles. CarShake\'s AI is trained to detect subtle paint changes that you might miss with the naked eye.', 'Hand wash services pose different risks: rings, watches, and dirty cloths can create fine scratches. Whether automated or hand wash, documenting your car\'s condition before and after gives you protection.'] },
  'parking-garage': { h1: 'Protect Your Car in a Parking Garage', title: 'Protect Your Car in a Parking Garage — CarShake', metaDescription: 'Document your car before parking in a garage. AI comparison catches door dings, bumper bumps, and theft.', paragraphs: ['Parking garages are high-risk environments for vehicle damage. Tight spaces, low clearance, pillars, and other drivers mean door dings, bumper scrapes, and mirror damage are daily occurrences.', 'CarShake lets you document your car\'s condition in 60 seconds before entering the garage. When you return, a quick scan and AI comparison flags any new damage — with exact location and severity.', 'Unlike street parking, garage damage can involve structural elements like low-hanging pipes, sharp concrete pillars, and tight spiral ramps. CarShake captures all 8 angles including roof clearance, side mirrors, and bumper overhangs.'] },
  'street-parking': { h1: 'Protect Your Car During Street Parking', title: 'Protect Your Car During Street Parking — CarShake', metaDescription: 'Street parking exposes your car to the highest risk. AI-verified documentation before you park on any street.', paragraphs: ['Street parking exposes your car to the highest risk of any parking scenario: passing traffic, cyclists, delivery trucks, parking enforcement, and pedestrians. Hit-and-run damage is common and nearly impossible to attribute without documentation.', 'CarShake captures your car\'s condition from all 8 angles in 60 seconds. If you return to find new damage, the AI comparison provides timestamped, GPS-verified evidence of exactly when the damage appeared.', 'Insurance claims for street parking damage are notoriously difficult because you can rarely prove when or where it happened. CarShake closes that gap with structured evidence.'] },
  'dealership-service': { h1: 'Protect Your Car at Dealership Service', title: 'Protect Your Car at Dealership Service — CarShake', metaDescription: 'Document your car before and after dealer service appointments. AI comparison catches new damage.', paragraphs: ['When you drop your car at a dealership for service, you\'re trusting technicians with your vehicle. Service bays are tight, tools are everywhere, and multiple people move your car throughout the day.', 'Scan before drop-off and after pickup. CarShake\'s AI comparison catches any new scratches, dents, or damage that occurred during service — even in areas unrelated to the service work.', 'Dealerships handle hundreds of cars daily. Accidents happen. Your CarShake record ensures you don\'t pay for damage you didn\'t cause.'] },
  'concert-parking': { h1: 'Protect Your Car at Concert Parking', title: 'Protect Your Car at Concert Parking — CarShake', metaDescription: 'High-volume event parking is high-risk. Document your car before the concert. AI catches parking lot damage.', paragraphs: ['Concert and event parking lots are high-volume, high-risk environments. Thousands of cars, excited drivers, limited lighting, and minimal supervision create the perfect conditions for parking lot damage.', 'Scan your car before entering the event lot. After the concert, scan again from the same angles. CarShake\'s AI comparison catches every new door ding, bumper bump, and scrape.', 'Event parking lots are often unmonitored, and by the time you notice damage, the responsible driver is long gone. CarShake gives you the proof you need.'] },
  'restaurant-valet': { h1: 'Protect Your Car at Restaurant Valet', title: 'Protect Your Car at Restaurant Valet — CarShake', metaDescription: 'Restaurant valet is one of the most common valet scenarios. QR handover proof with AI-verified scans.', paragraphs: ['Restaurant valet parking is one of the most common valet interactions in America. From upscale steakhouses to casual dining, valet service is standard at thousands of restaurants nationwide.', 'The challenge with restaurant valet is speed — attendants move cars quickly to handle high volumes. Quick maneuvers in tight lots increase the risk of minor collisions, curb scrapes, and door dings.', 'CarShake\'s 60-second scan before handing over your keys creates an irrefutable record. The QR handover gives digital confirmation that both sides agree on your car\'s documented condition.'] },
  'tailgating': { h1: 'Protect Your Car During Tailgating', title: 'Protect Your Car During Tailgating — CarShake', metaDescription: 'Tailgating parking lots are chaotic. Document your car before game day parking. AI catches every new dent.', paragraphs: ['Tailgating parking lots are among the most hazardous environments for your vehicle. Thousands of fans, grills, coolers, tents, and parked cars in grass fields or gravel lots create constant risk of damage.', 'Before you head into the stadium, scan your car with CarShake. The 60-second, 8-angle scan captures your car\'s complete condition. When you return, scan again and AI compares every angle.', 'Tailgating lot damage from game day chaos is extremely common. Without documentation, you have no recourse. CarShake gives you court-ready evidence.'] },
};

const VEHICLES = {
  'suv': { display: 'SUV', title: 'Protect Your SUV at Valet Parking — CarShake', metaDesc: 'SUVs are high-value valet targets. AI-verified condition scans before & after. Document your Escalade, Tahoe, or Grand Cherokee in 60 seconds.', paragraphs: ['SUVs are the most common vehicle at valet stands — from high-volume hotel lots to upscale restaurant valet. Their size, weight, and price tag make every parking interaction a risk. A $80,000+ Escalade or Tahoe in a tight parking garage means blind spots, curb contact, and door dings from adjacent vehicles.', 'Taller ride height means parking garage clearance bars, low-hanging pipes, and cement ceiling beams are a constant threat. Roof rails, crossbars, and panoramic sunroofs add vulnerable points that standard inspections miss.', 'CarShake captures all vulnerable angles in 60 seconds. The 8-angle scan includes roof clearance markers, side mirror protrusion, running boards, and rear bumper overhang — the exact spots SUVs get damaged at valet.'] },
  'sedan': { display: 'Sedan', title: 'Protect Your Sedan at Valet Parking — CarShake', metaDesc: 'Compact and mid-size sedans get overlooked. AI-verified documentation catches every valet scratch.', paragraphs: ['Sedans — from compact Civics to full-size S-Class Mercedes — are the most valet-parked vehicles in America. Their lower profile means bumpers, side skirts, and front air dams are closest to curbs and parking stops.', 'A valet handling dozens of cars per shift may not notice a front bumper scrape against a curb or a side mirror contact with a garage pillar. Without documented proof, these minor damages become your repair bill.', 'CarShake\'s 8-angle scan covers every vulnerable point on your sedan: front bumper overhang, side mirror protrusion, door edges, wheel rims, and rear bumper. The AI comparison detects even subtle paint transfer.'] },
  'truck': { display: 'Pickup Truck', title: 'Protect Your Pickup Truck at Valet — CarShake', metaDesc: 'Full-size trucks have unique valet risks: bed rails, tailgates, and step bars. AI-verified documentation.', paragraphs: ['Pickup trucks are increasingly found at hotel and resort valet lots. Their long wheelbase, high bed sides, and heavy-duty construction create unique vulnerability points.', 'Truck beds, tailgates, and bed rail caps are common damage points that standard walk-around inspections miss. A valet backing a long-bed F-150 into a tight spot may scrape the rear bumper.', 'CarShake captures all angles including your truck bed, tailgate, step bars or running boards, and clearance height. The 60-second scan documents your truck\'s condition completely.'] },
  'luxury': { display: 'Luxury & Exotic', title: 'Protect Your Luxury or Exotic Car at Valet — CarShake', metaDesc: 'Luxury and exotic cars need special protection at valet. AI-verified documentation for Ferraris, Lamborghinis, Bentleys, and more.', paragraphs: ['If you drive a luxury or exotic car, every valet interaction is a $100,000+ risk. A single curb scrape on a Lamborghini front splitter costs $5,000+ to repair. A door ding on a Ferrari door panel can require a full repaint.', 'Most car damage documentation tools aren\'t designed for exotic cars. CarShake\'s 8-angle high-resolution scan captures every inch of your vehicle\'s finish, including low-clearance front splitters, wide side sills, and delicate rear diffusers.', 'When you\'re driving a six-figure vehicle, the standard quick walk-around doesn\'t cut it. CarShake provides the comprehensive, court-admissible documentation that protects your investment at every valet stop.'] },
  'ev': { display: 'Electric Vehicle', title: 'Protect Your Electric Vehicle at Valet — CarShake', metaDesc: 'EVs have unique valet risks: glass roofs, charging ports, sensors. AI-verified documentation for Teslas, Rivians, Lucids.', paragraphs: ['Electric vehicles present unique valet parking risks. Glass roofs, flush door handles, charging ports, and sensor clusters are expensive to repair and easily damaged. A broken charging door on a Tesla costs $1,500+.', 'Many valets are unfamiliar with EV-specific features: how to open flush door handles without damaging paint, where charging ports are located, and how to avoid pressure on glass roof panels.', 'CarShake\'s EV-specific scan path includes glass roof corners, charging port doors, flush door handle surrounds, sensor positions, and underbody battery pack clearance.'] },
  'minivan': { display: 'Minivan / Family Vehicle', title: 'Protect Your Minivan or Family Vehicle at Valet — CarShake', metaDesc: 'Family vehicles get the most daily use. AI-verified scans protect your family car at valet.', paragraphs: ['Minivans and family vehicles are the workhorses of American roads — and the most likely to accumulate parking damage without anyone noticing. Sliding doors, roof racks, rear liftgates are all vulnerable.', 'Family vehicles often carry roof boxes, bike racks, and other accessories that extend the vehicle\'s dimensions. A valet parking your minivan with a roof box may not account for extra height.', 'CarShake captures your vehicle with all accessories attached. The 8-angle scan ensures every square inch is recorded before anyone else touches your family car.'] },
};

const VEHICLE_LIST = [
  { slug: 'suv', display: 'SUV', desc: 'Escalade, Tahoe, Explorer, Grand Cherokee, and all SUVs' },
  { slug: 'sedan', display: 'Sedan', desc: 'Civic, Camry, S-Class, 3-Series, and all sedans' },
  { slug: 'truck', display: 'Pickup Truck', desc: 'F-150, Silverado, RAM, Tacoma, and all trucks' },
  { slug: 'luxury', display: 'Luxury & Exotic', desc: 'Ferrari, Lamborghini, Bentley, Rolls-Royce, McLaren' },
  { slug: 'ev', display: 'Electric Vehicle', desc: 'Tesla, Rivian, Lucid, Porsche Taycan, Mustang Mach-E' },
  { slug: 'minivan', display: 'Minivan / Family SUV', desc: 'Odyssey, Sienna, Pacifica, Grand Highlander' },
];

const BLOG_POSTS = [
  {
    title: 'How to Never Pay for Valet Damage Again: The 3-Stop Protocol',
    date: 'June 15, 2026',
    excerpt: 'Valet damage costs American drivers over $2 billion annually. Here\'s a 3-minute system that gives you irrefutable proof — and saves you thousands.',
    url: '/blog/3-stop-protocol',
    body: `<h2>How to Never Pay for Valet Damage Again: The 3-Stop Protocol</h2>
<p>Valet parking is a $12 billion industry in the United States. Every day, millions of drivers hand their keys to strangers and trust their vehicles will come back in the same condition.</p>
<p>They don't. Valet damage costs American drivers over $2 billion annually in repairs, deductibles, and increased insurance premiums. And the most expensive part? Most of that damage is paid for by the driver — because they can't prove it didn't exist before valet took the keys.</p>
<p>This is where the CarShake 3-Stop Protocol changes everything.</p>
<h3>Stop 1: The 60-Second Scan</h3>
<p>Before you hand over your keys, walk around your car with CarShake. Eight photos. Eight angles. Sixty seconds. The AI captures every scratch, dent, and ding that already exists on your vehicle.</p>
<h3>Stop 2: The QR Handover</h3>
<p>When you present your QR code to the valet, they scan it. Both parties now have a digitally signed agreement on your car's condition at the moment of handover. No more "he said, she said."</p>
<h3>Stop 3: AI Comparison at Pickup</h3>
<p>When you return, scan again. CarShake's AI compares every angle against the drop-off scan and flags every change. GPS-timestamped. SHA-256 hashed. Court-admissible.</p>
<p>The 3-Stop Protocol takes three minutes and costs nothing. The alternative is paying thousands out of pocket.</p>`
  },
  {
    title: 'The Ferrari Incident: Why I Built CarShake',
    date: 'May 28, 2026',
    excerpt: 'December 2023. Beverly Hills hotel. $4,200 in damage. Zero proof. Here\'s the exact story that led to CarShake — and how it can save your car.',
    url: '/blog/ferrari-incident',
    body: `<h2>The Ferrari Incident: Why I Built CarShake</h2>
<p>December 2023. I pulled up to a hotel in Beverly Hills. The valet opened my door, handed me a ticket, and drove my Ferrari 488 GTB into the parking structure.</p>
<p>When I picked up the car two hours later, the front splitter was scraped. $4,200 in damage. The carbon fiber was ground down to the weave.</p>
<p>I walked up to the valet manager. He looked at the damage, looked at me, and shrugged: "How do we know it wasn't like that when you dropped it?"</p>
<p>He was right. I had nothing. No photos. No video. No witness. Just my word against theirs.</p>
<p>I paid $4,200 out of pocket. And I swore I'd never let it happen again.</p>
<p>That's why I built CarShake. It's a tool that creates irrefutable evidence in 60 seconds — so no driver ever has to pay for damage they didn't cause.</p>`
  },
  {
    title: 'Understanding Bailment Law: Your Legal Rights at Valet Parking',
    date: 'May 10, 2026',
    excerpt: 'When you hand your keys to a valet, you enter a bailment agreement. Here\'s what that means for your legal rights — and how to enforce them.',
    url: '/blog/bailment-law-valet',
    body: `<h2>Understanding Bailment Law: Your Legal Rights at Valet Parking</h2>
<p>When you hand your keys to a valet attendant, you enter into a legal relationship called a bailment. In legal terms, you are the bailor (entrusting your property) and the valet operator is the bailee (accepting responsibility for it).</p>
<h3>What Bailment Means for You</h3>
<p>Under bailment law, the bailee (valet) owes a duty of care for your vehicle. The level of care depends on whether the bailment is:</p>
<ul>
<li><strong>For mutual benefit</strong> — You're paying for parking, and the valet is being paid. They owe "ordinary care."</li>
<li><strong>Gratuitous</strong> — Free valet. They owe slightly less, but still must not be grossly negligent.</li>
</ul>
<h3>The Proof Problem</h3>
<p>Here's the catch: bailment law helps you <em>if</em> you can prove the damage happened while the valet had possession of your car. Without that proof, you have no case. The valet's first defense is always: "That damage was already there."</p>
<p>CarShake closes this loophole completely. By creating a timestamped, GPS-verified, SHA-256 hashed record of your car's condition at the exact moment of handover, you prove exactly when your car was damage-free.</p>`
  },
  {
    title: '5 Things Valet Companies Don\'t Want You to Know',
    date: 'April 22, 2026',
    excerpt: 'Inside secrets from the valet industry: what their liability disclaimers really mean, how they train attendants, and the one thing that makes them pay immediately.',
    url: '/blog/valet-secrets',
    body: `<h2>5 Things Valet Companies Don't Want You to Know</h2>
<ol>
<li><strong>Their liability disclaimers are weaker than they look.</strong> Many valet tickets say "not responsible for damage" — but gross negligence can never be disclaimed. If a valet crashes your car, they're liable regardless of what the ticket says.</li>
<li><strong>Attendants are often undertrained.</strong> Many valet attendants receive minimal training. High turnover means inexperienced drivers handle your $80,000 vehicle. Document everything.</li>
<li><strong>Most valet companies settle fast when you have proof.</strong> The single most powerful tool you can have is documented evidence of your car's condition before handover. Valet companies know they'll lose in court.</li>
<li><strong>Your insurance will cover it — with a deductible.</strong> Comprehensive insurance covers valet damage, but you'll pay your deductible (typically $500-$1,000) and your rates may increase. Prevention is cheaper.</li>
<li><strong>Hotels and restaurants rarely inspect returned vehicles.</strong> Most damage is discovered hours or days later — long after the valet shift ended. That's why immediate documentation matters.</li>
</ol>`
  },
  {
    title: 'Top 10 US Cities Where Valet Damage is Most Common',
    date: 'April 5, 2026',
    excerpt: 'Some cities are worse than others for valet parking damage. Here are the top 10 high-risk cities — plus how to protect your car in each one.',
    url: '/blog/valet-damage-cities',
    body: `<h2>Top 10 US Cities Where Valet Damage is Most Common</h2>
<p>Not all valet parking is created equal. Based on insurance claims, forum data, and user reports, these are the high-risk cities:</p>
<ol>
<li><strong>Las Vegas, NV</strong> — The valet capital. Massive volumes, casino valets handling thousands of cars daily.</li>
<li><strong>Los Angeles, CA</strong> — Restaurant and hotel valet density is among the highest in the world.</li>
<li><strong>Miami, FL</strong> — South Beach nightlife creates high-speed, high-volume valet operations.</li>
<li><strong>San Francisco, CA</strong> — Notorious for break-ins and tight parking structures.</li>
<li><strong>New York, NY</strong> — Extreme parking density, tight garages, high-pressure valet operations.</li>
<li><strong>Chicago, IL</strong> — Winter conditions add salt damage and ice-related accidents.</li>
<li><strong>Boston, MA</strong> — Narrow streets and historic buildings create tight parking challenges.</li>
<li><strong>Atlanta, GA</strong> — Buckhead and Midtown have high-density valet coverage.</li>
<li><strong>Nashville, TN</strong> — Explosive tourism growth strains valet infrastructure.</li>
<li><strong>Orlando, FL</strong> — Theme park parking structures with enormous vehicle volumes.</li>
</ol>
<p>CarShake works in all 50 states — and our city-specific guides give you local bailment law info for each location.</p>`
  },
  {
    title: 'AI vs. Valet: How Computer Vision Is Making Parking Safer',
    date: 'March 18, 2026',
    excerpt: 'The same AI technology that powers self-driving cars is now protecting your vehicle at valet. Here\'s how computer vision compares before and after.',
    url: '/blog/ai-valet-comparison',
    body: `<h2>AI vs. Valet: How Computer Vision Is Making Parking Safer</h2>
<p>Computer vision has advanced dramatically in the last five years. The same AI that identifies pedestrians for self-driving cars can now detect microscopic paint damage on your vehicle.</p>
<h3>How CarShake AI Works</h3>
<p>CarShake's AI comparison engine takes your before and after scan photos and analyzes them pixel-by-pixel. It identifies:</p>
<ul>
<li>New scratches and swirl marks</li>
<li>Dents and dings</li>
<li>Paint transfer from other vehicles</li>
<li>Curb rash on wheels</li>
<li>Bumper scrapes and scuffs</li>
<li>Glass cracks and chips</li>
</ul>
<p>The AI is trained on thousands of vehicle damage images and can detect damage that's invisible to the naked eye. Combined with GPS coordinates, server timestamps, and SHA-256 hashing, every comparison is forensically verifiable.</p>`
  }
];

const SCENARIOS = {
  'parallel-parking': { display: 'Parallel Parking', title: 'Protect Your Car During Parallel Parking — CarShake', metaDesc: 'Parallel parking causes bumper scrapes, curb rash, and mirror damage. AI-verified documentation before you park.', paragraphs: ['Parallel parking is one of the highest-risk maneuvers for vehicle damage. Curb rash on alloy wheels, front bumper scrapes, rear bumper contact, and side mirror folding are all common outcomes. In cities like San Francisco, New York, and Boston where parallel parking is the norm, drivers accept these risks daily.', 'The problem is proving damage occurred during parking, not before. A fresh curb scrape looks the same as an old one. Without documented proof of your car\'s pre-parking condition, you can\'t hold anyone accountable for new damage.', 'CarShake solves this. Before you parallel park anywhere, take 60 seconds to scan your car. When you return, scan again. AI comparison flags new curb rash, bumper scrapes, or mirror damage.'] },
  'valet-parking-scenario': { display: 'Valet Parking', title: 'Protect Your Car at Valet Parking — Full Guide', metaDesc: 'Complete guide to valet parking protection. AI-verified scans, QR handover proof, and AI comparison at pickup.', paragraphs: ['Valet parking combines all the risks of parking with the complication of a third party handling your vehicle. When you hand your keys to a valet, you\'re entering an implicit bailment agreement.', 'Most valet tickets include liability disclaimers. Even with those, gross negligence cannot be disclaimed. But without proof of your car\'s condition before the valet took it, you have no foundation for any claim.', 'CarShake creates that foundation in 60 seconds. The QR-based handover creates a mutual digital signature. AI comparison at pickup catches every new scratch, dent, and ding.'] },
  'parking-lot': { display: 'Parking Lot', title: 'Protect Your Car in Any Parking Lot — CarShake', metaDesc: 'Parking lots cause door dings, shopping cart damage, and bumper bumps. Document before parking.', paragraphs: ['Parking lots are the #1 location for vehicle damage in America. Door dings from adjacent cars, shopping cart collisions, bumper bumps from poorly parked vehicles — and no attendant to hold accountable.', 'Insurance claims for parking lot damage are notoriously difficult because you can rarely prove when it happened. A door ding could have been there for weeks.', 'CarShake gives you the evidence you need. Document your car before entering any parking lot. The 60-second scan creates a complete record. AI comparison catches new damage instantly.'] },
  'night-parking': { display: 'Night Parking', title: 'Night Parking Protection — CarShake', metaDesc: 'Parking at night increases damage risk. AI-verified car scans work in low light.', paragraphs: ['Parking at night introduces unique risks: reduced visibility, tired drivers with impaired judgment, dimly lit parking structures, and the inability to inspect your car properly at pickup.', 'Street parking overnight is especially risky. Hit-and-run damage, vandalism, and parking structure collisions are more common at night.', 'CarShake works in low-light conditions. Document your car before parking for the night, and scan again in the morning. The AI comparison works regardless of lighting conditions.'] },
  'event-valet': { display: 'Event Valet', title: 'Event Valet Parking Protection — CarShake', metaDesc: 'High-volume event valet needs extra protection. AI-verified documentation for weddings, galas, and events.', paragraphs: ['Event valet — at weddings, galas, fundraisers, and corporate events — involves high volumes of vehicles in compressed timeframes. Attendants are often temporary workers unfamiliar with the parking environment.', 'Thousands of cars pass through event valet operations. Exhausted drivers, dark parking areas, and rushed attendants create conditions where damage is more likely.', 'CarShake protects both you and the event. Document your car before handing over the keys. When you pick up, AI comparison catches every new scratch.'] },
  'tailgating': { display: 'Tailgating', title: 'Tailgating Parking Protection — CarShake', metaDesc: 'Tailgating parking is chaotic. Document before game day parking catches every new dent.', paragraphs: ['Tailgating parking lots are among the most hazardous environments for your vehicle. Thousands of fans, grills, coolers, and parked cars in grass fields or gravel lots create constant risk of damage.', 'Tailgating damage is extremely common. Without documentation, you have no recourse.', 'CarShake gives you court-ready evidence. Scan before entering the lot, scan again after. AI catches every new dent, scratch, and scrape.'] },
};

// ── Brunson Components (CSS-class based, Design System v2) ────────

function brunsonStorySection() {
  return `<!-- Brunson: Story + Old Way/New Way + 3-Stop Protocol -->
<section class="cs-stack cs-stack-md" style="margin:var(--cs-space-5) 0">
  <div class="cs-card cs-card-gold-border">
    <p class="cs-pullquote">I built CarShake because my Ferrari got damaged at valet — and I had zero proof.</p>
    <p class="cs-body-sm">December 2023. I handed my keys to a hotel valet in Beverly Hills. When the car came back, the front splitter was scraped — $4,200 in damage. The valet manager shrugged: "How do we know it wasn't like that when you dropped it?"</p>
    <p class="cs-body-sm">He was right. I had <em>nothing</em>. No photos. No witness. No proof. I paid for the repair out of pocket — and I swore I'd never let it happen again.</p>
    <p class="cs-body-sm"><strong>That's why I built CarShake.</strong> 60-second AI-verified car scans. QR handover proof. Both sides sign. When damage appears, you have irrefutable evidence. I couldn't save my $4,200 — but I can save yours.</p>
  </div>

  <div class="cs-card cs-card-dark" style="text-align:center">
    <h3 class="cs-h3" style="color:var(--cs-gold)">The Old Way vs. The CarShake Way</h3>
    <div class="cs-grid-2" style="margin-top:var(--cs-space-3)">
      <div class="cs-card" style="background:var(--cs-error-bg);border-color:var(--cs-error-border);text-align:left">
        <p class="cs-label" style="color:var(--cs-error)">❌ The Old Way</p>
        <p class="cs-body-sm" style="color:var(--cs-error)">Hand over your keys. Hope nothing happens. If damage appears — argue, fight, pay out of pocket. No proof = no leverage.</p>
      </div>
      <div class="cs-card" style="background:var(--cs-success-bg);border-color:var(--cs-success-border);text-align:left">
        <p class="cs-label" style="color:var(--cs-success)">✅ The CarShake Way</p>
        <p class="cs-body-sm" style="color:var(--cs-success)">60-second scan captures all 8 angles. QR code creates a mutual digital handshake. AI compares before & after. You have court-ready evidence before anyone touches your car.</p>
      </div>
    </div>
  </div>

  <div class="cs-card">
    <h3 class="cs-h3">The CarShake 3-Stop Protocol&trade;</h3>
    <p class="cs-body-sm">Most car damage disputes are lost before they start — because the victim can't prove <em>when</em> the damage happened. The 3-Stop Protocol fixes that. Three minutes. Three actions. Zero arguments.</p>
    <div class="cs-stack cs-stack-md">
      <div style="display:flex;gap:var(--cs-space-3);align-items:flex-start">
        <span class="cs-step">1</span>
        <div>
          <p class="cs-body" style="font-weight:700;margin-bottom:0.125rem;color:var(--cs-text)">Stop & Scan</p>
          <p class="cs-body-sm" style="margin-bottom:0">Open CarShake. Walk around your car. 8 photos cover every vulnerable angle. Takes 60 seconds — less time than pumping gas.</p>
        </div>
      </div>
      <div style="display:flex;gap:var(--cs-space-3);align-items:flex-start">
        <span class="cs-step">2</span>
        <div>
          <p class="cs-body" style="font-weight:700;margin-bottom:0.125rem;color:var(--cs-text)">QR Handover Proof</p>
          <p class="cs-body-sm" style="margin-bottom:0">Show the attendant your QR code. They scan it. Both parties digitally confirm the car's condition. No more "he said, she said."</p>
        </div>
      </div>
      <div style="display:flex;gap:var(--cs-space-3);align-items:flex-start">
        <span class="cs-step">3</span>
        <div>
          <p class="cs-body" style="font-weight:700;margin-bottom:0.125rem;color:var(--cs-text)">AI Comparison at Pickup</p>
          <p class="cs-body-sm" style="margin-bottom:0">When you get your car back, scan again. AI compares every angle, flags every new scratch, dent, or scrape. GPS-timestamped. Court-admissible. Done.</p>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function brunsonLeadSection() {
  return `<!-- Brunson: Email Capture / Lead Magnet -->
<section class="cs-card cs-card-dark" style="text-align:center;margin:var(--cs-space-4) 0">
  <h3 class="cs-h3" style="color:white">Free: The Valet Damage Playbook</h3>
  <p class="cs-body-sm" style="color:var(--cs-text-muted)">5 things valet companies don't want you to know. The exact bailment law loopholes that can save you thousands. Plus: CarShake free trial access.</p>
  <form class="cs-email-form cs-form-stack" action="javascript:void(0)" data-source="seo-lead-magnet">
    <input type="email" class="cs-email-input" placeholder="your@email.com" required />
    <button type="submit" class="cs-email-btn">Send Me The Free Playbook &rarr;</button>
  </form>
  <div class="cs-email-success" style="display:none;padding:var(--cs-space-3);background:var(--cs-success);border-radius:var(--cs-radius-md);color:white;font-weight:600">&#10003; Check your email for the free Valet Damage Playbook</div>
  <p class="cs-body-sm" style="color:var(--cs-text-muted);margin:var(--cs-space-2) 0 0;font-size:0.75rem">No spam. 1 email. Instant download.</p>
</section>`;
}

function brunsonCTA(btnText = "Try CarShake — Free", btnUrl = "/#demo", subtext = "No app download. 60 seconds. AI-powered.") {
  return `<!-- Brunson: Call to Action -->
<section class="cs-card cs-card-gold-border" style="text-align:center;margin:var(--cs-space-5) 0">
  <p class="cs-pullquote" style="margin-bottom:var(--cs-space-2)">Don't let valet damage cost you thousands.</p>
  <p class="cs-body-sm">${subtext}</p>
  <a href="${btnUrl}" class="cs-btn cs-btn-primary" style="margin-top:var(--cs-space-2)">${btnText}</a>
</section>`;
}

// ── Header / Footer Templates ────────────────────────────────────

function headerHtml() {
  return `<header class="cs-header">
  <div class="cs-header-inner">
    <a href="/" class="cs-logo">CarShake</a>
    <nav class="cs-nav">
      <a href="/city" class="cs-nav-link">Cities</a>
      <a href="/pricing" class="cs-nav-link">Pricing</a>
      <a href="/#demo" class="cs-nav-cta">Try Free</a>
    </nav>
  </div>
</header>`;
}

function footerHtml() {
  return `<footer class="cs-footer">
  <p class="cs-footer-brand">CarShake</p>
  <p class="cs-footer-text">&copy; 2026 CarShake &middot; carshake.online</p>
</footer>`;
}

function movementHtml() {
  return `<!-- Brunson: Future-Based Cause -->
<section class="cs-movement">
  <p class="cs-movement-title">Join the Movement</p>
  <p class="cs-movement-text">We're building a world where no driver pays for damage they didn't cause. Every scan makes parking more accountable. Every shared experience protects another driver.</p>
  <nav class="cs-movement-links">
    <a href="/how-it-works" class="cs-movement-link">How It Works</a>
    <a href="/pricing" class="cs-movement-link">Pricing</a>
    <a href="/compare" class="cs-movement-link">Compare</a>
    <a href="/trust" class="cs-movement-link">Trust &amp; Security</a>
    <a href="/blog" class="cs-movement-link">Blog</a>
    <a href="/faq" class="cs-movement-link">FAQ</a>
  </nav>
</section>
${footerHtml()}`;
}

// ── Body HTML generation ─────────────────────────────────────────

function bodyCity({ displayName, city, slug }) {
  return `${headerHtml()}
<main class="cs-container cs-section">
  <nav class="cs-breadcrumb">
    <a href="/">Home</a> / <a href="/city">City Guides</a> / <span>${displayName}</span>
  </nav>
  <h1 class="cs-h1">Protect Your Car at Valet Parking in ${displayName}</h1>
  ${brunsonStorySection()}
  <p class="cs-body">${displayName}, ${city.state} is ${city.parkingNotable}. When you hand your keys to a valet, you're trusting someone with a vehicle worth thousands of dollars. Without documented proof of your car's condition before the handover, you have no defense if damage appears at pickup.</p>
  <p class="cs-body">CarShake creates a signed, timestamped, AI-verified record of your car's condition in 60 seconds — right from your phone, no app download needed. The parking attendant scans your QR code and confirms. Both sides sign. Both sides are protected.</p>
  <p class="cs-body">With a population of ${city.population}, ${displayName} has thousands of daily valet interactions. CarShake gives ${displayName} drivers peace of mind that every scratch, dent, and ding is documented before anyone else touches your car.</p>
  ${brunsonLeadSection()}
  ${brunsonCTA()}
  <h2 class="cs-h2" style="margin-top:var(--cs-space-5)">Valet Scenarios in ${displayName}</h2>
  <div class="cs-stack cs-stack-md">
    <a href="/protect/valet-parking" class="cs-card cs-card-interactive"><h3 class="cs-h3">Valet Parking Protection</h3><p class="cs-body-sm">How to document your car before handing keys to a valet attendant</p></a>
    <a href="/protect/hotel-parking" class="cs-card cs-card-interactive"><h3 class="cs-h3">Hotel Parking Protection</h3><p class="cs-body-sm">Protect your car during hotel stays and overnight valet parking</p></a>
    <a href="/protect/airport-parking" class="cs-card cs-card-interactive"><h3 class="cs-h3">Airport Parking Protection</h3><p class="cs-body-sm">Document your car before long-term airport parking in ${displayName}</p></a>
  </div>
  <p style="text-align:center;margin-top:var(--cs-space-4)"><a href="/city" class="cs-movement-link">&larr; All City Guides</a></p>
</main>
${movementHtml()}`;
}

function bodyState({ displayName, data, slug }) {
  return `${headerHtml()}
<main class="cs-container cs-section">
  <h1 class="cs-h1">Valet Parking Liability Laws in ${displayName}</h1>
  ${brunsonStorySection()}
  <div class="cs-stack cs-stack-md" style="margin-bottom:var(--cs-space-5)">
    <div class="cs-card">
      <h2 class="cs-h3">Governing Bailment Law</h2>
      <p class="cs-body-sm">${data.bailmentLaw}</p>
    </div>
    <div class="cs-card">
      <h2 class="cs-h3">Statute of Limitations</h2>
      <p class="cs-body-sm">You have <strong>${data.statuteOfLimitations}</strong> to file a claim for valet parking damage in ${displayName}.</p>
    </div>
    <div class="cs-card">
      <h2 class="cs-h3">Notable Application</h2>
      <p class="cs-body-sm">${data.notableCase}</p>
    </div>
  </div>
  <div class="cs-card cs-card-gold-border">
    <h3 class="cs-h3">Why evidence matters in ${displayName}</h3>
    <p class="cs-body-sm">Legal rights don't matter unless you can prove when damage occurred. CarShake creates GPS-verified, timestamped, SHA-256 hashed evidence of your car's condition before and after valet parking — admissible evidence that changes the outcome of disputes.</p>
    ${brunsonLeadSection()}
    ${brunsonCTA("Get Proof Before You Park — Free", "/#demo", "60 seconds. 8 angles. Court-admissible.")}
  </div>
  <p style="text-align:center;margin-top:var(--cs-space-3)"><a href="/" class="cs-movement-link">&larr; Back to CarShake Home</a></p>
</main>
${movementHtml()}`;
}

function bodyUsecase({ h1, paragraphs, slug, displayName }) {
  const paras = paragraphs.map(p => `<p class="cs-body">${p}</p>`).join('\n');
  return `${headerHtml()}
<main class="cs-container cs-section">
  <h1 class="cs-h1">${h1}</h1>
  ${brunsonStorySection()}
  ${paras}
  ${brunsonLeadSection()}
  ${brunsonCTA()}
</main>
${movementHtml()}`;
}

function bodyVehicle({ displayName, data, slug }) {
  const paras = data.paragraphs.map(p => `<p class="cs-body">${p}</p>`).join('\n');
  return `${headerHtml()}
<main class="cs-container cs-section">
  <h1 class="cs-h1">${data.title}</h1>
  ${brunsonStorySection()}
  ${paras}
  ${brunsonLeadSection()}
  ${brunsonCTA()}
</main>
${movementHtml()}`;
}

function bodyScenario({ displayName, data, slug }) {
  const paras = data.paragraphs.map(p => `<p class="cs-body">${p}</p>`).join('\n');
  return `${headerHtml()}
<main class="cs-container cs-section">
  <h1 class="cs-h1">${data.title}</h1>
  ${brunsonStorySection()}
  ${paras}
  ${brunsonLeadSection()}
  ${brunsonCTA()}
</main>
${movementHtml()}`;
}

// ── Write page files ─────────────────────────────────────────────

function writePage(subdir, filename, html) {
  const dir = resolve(DIST, subdir);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, filename), html, 'utf8');
}

const pages = [];

// ── 1. City pages (40 pages) ─────────────────────────────────────
for (const [slug, city] of Object.entries(CITIES)) {
  const displayName = slugToDisplay(slug);
  const canonical = `${SITE}/city/${slug}`;
  const title = truncate(`Protect Your Car at Valet in ${displayName}, ${city.state} — CarShake`, 60);
  const description = truncate(`AI-verified car scans before & after valet parking in ${displayName}. 60-second QR handover proof. Free, no app download. Trusted by ${displayName} drivers.`, 155);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `CarShake — ${displayName}`,
    description,
    areaServed: { '@type': 'City', name: displayName },
    url: canonical,
  };
  const bodyHtml = bodyCity({ displayName, city, slug });
  const html = injectMetaBody(baseHtml, { title, description, canonical, ogTitle: title, ogDesc: description, jsonLd, bodyHtml });
  writePage(`city/${slug}`, 'index.html', html);
  pages.push(canonical);
  console.log(`  ✓ /city/${slug}`);
}

// ── 2. City index ─────────────────────────────────────────────────
{
  const canonical = `${SITE}/city`;
  const title = 'Valet Parking Protection by City — CarShake City Guides';
  const description = truncate('Find your city guide for protecting your car at valet parking. AI-verified car condition scans available in 40+ US cities.', 155);
  const bodyHtml = `${headerHtml()}
<main class="cs-container-wide cs-section">
  <h1 class="cs-h1" style="margin-bottom:0.25rem">City Valet Protection Guides</h1>
  <p class="cs-body">Protect your car at valet parking in cities across America</p>
  <div class="cs-grid-auto" style="margin-top:var(--cs-space-4)">
${CITIES_LIST.map(c => `    <a href="/city/${c.slug}" class="cs-card cs-card-interactive"><h2 style="font-size:1rem;font-weight:700;margin:0 0 0.25rem">${c.display}</h2><p class="cs-body-sm" style="margin:0">${c.state}</p></a>`).join('\n')}
  </div>
  <div class="cs-card cs-card-gold-border" style="text-align:center;margin-top:var(--cs-space-5)">
    <p style="font-weight:700;margin-bottom:var(--cs-space-1)">Your city not listed?</p>
    <p class="cs-body-sm">CarShake works everywhere.</p>
    <a href="/#demo" class="cs-btn cs-btn-primary" style="margin-top:var(--cs-space-2)">Try CarShake — Free</a>
  </div>
</main>
${movementHtml()}`;
  const html = injectMetaBody(baseHtml, { title, description, canonical, ogTitle: title, ogDesc: description, bodyHtml });
  writePage('city', 'index.html', html);
  pages.push(canonical);
  console.log('  ✓ /city');
}

// ── 3. State pages (29 pages) ────────────────────────────────────
for (const [slug, data] of Object.entries(STATES)) {
  const displayName = data.name;
  const canonical = `${SITE}/state/${slug}`;
  const title = truncate(`Valet Parking Liability in ${displayName} — CarShake Legal Guide`, 60);
  const description = truncate(`Learn about valet parking bailment laws, liability limits, and statute of limitations in ${displayName}. Protect your car with AI-verified documentation.`, 155);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: title,
    description,
    about: `Valet parking liability laws in ${displayName}`,
  };
  const bodyHtml = bodyState({ displayName, data, slug });
  const html = injectMetaBody(baseHtml, { title, description, canonical, ogTitle: title, ogDesc: description, jsonLd, bodyHtml });
  writePage(`state/${slug}`, 'index.html', html);
  pages.push(canonical);
  console.log(`  ✓ /state/${slug}`);
}

// ── 4. Protect/Use-case pages (12 pages) ─────────────────────────
for (const [slug, uc] of Object.entries(USE_CASES)) {
  const displayName = slugToDisplay(slug).replace(/-/g, ' ');
  const canonical = `${SITE}/protect/${slug}`;
  const title = truncate(uc.title, 60);
  const description = truncate(uc.metaDescription, 155);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: title,
    description,
    about: `Protecting your car during ${displayName}`,
  };
  const bodyHtml = bodyUsecase({ h1: uc.h1, paragraphs: uc.paragraphs, slug, displayName });
  const html = injectMetaBody(baseHtml, { title, description, canonical, ogTitle: title, ogDesc: description, jsonLd, bodyHtml });
  writePage(`protect/${slug}`, 'index.html', html);
  pages.push(canonical);
  console.log(`  ✓ /protect/${slug}`);
}

// ── 5. Vehicle pages (7 pages) ───────────────────────────────────
for (const [slug, v] of Object.entries(VEHICLES)) {
  const canonical = `${SITE}/vehicle/${slug}`;
  const title = truncate(v.title, 60);
  const description = truncate(v.metaDesc, 155);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: title,
    description,
    about: `Protecting ${v.display} vehicles at valet parking`,
  };
  const bodyHtml = bodyVehicle({ displayName: v.display, data: v, slug });
  const html = injectMetaBody(baseHtml, { title, description, canonical, ogTitle: title, ogDesc: description, jsonLd, bodyHtml });
  writePage(`vehicle/${slug}`, 'index.html', html);
  pages.push(canonical);
  console.log(`  ✓ /vehicle/${slug}`);
}

// ── 6. Vehicle index ─────────────────────────────────────────────
{
  const canonical = `${SITE}/vehicle`;
  const title = 'Vehicle-Specific Valet Parking Protection — CarShake';
  const description = truncate('Find the right valet protection guide for your vehicle type. SUV, sedan, truck, luxury, EV, and family vehicle guides.', 155);
  const bodyHtml = `${headerHtml()}
<main class="cs-container-wide cs-section">
  <h1 class="cs-h1" style="margin-bottom:0.25rem">Vehicle-Specific Valet Guides</h1>
  <p class="cs-body">Protect your specific vehicle type at valet parking</p>
  <div class="cs-grid-auto" style="margin-top:var(--cs-space-4)">
${VEHICLE_LIST.map(v => `    <a href="/vehicle/${v.slug}" class="cs-card cs-card-interactive"><h2 style="font-size:1rem;font-weight:700;margin:0 0 0.25rem">${v.display}</h2><p class="cs-body-sm" style="margin:0">${v.desc}</p></a>`).join('\n')}
  </div>
</main>
${footerHtml()}`;
  const html = injectMetaBody(baseHtml, { title, description, canonical, ogTitle: title, ogDesc: description, bodyHtml });
  writePage('vehicle', 'index.html', html);
  pages.push(canonical);
  console.log('  ✓ /vehicle');
}

// ── 7. Scenario pages (6 pages) ─────────────────────────────────
for (const [slug, s] of Object.entries(SCENARIOS)) {
  const canonical = `${SITE}/scenario/${slug}`;
  const title = truncate(s.title, 60);
  const description = truncate(s.metaDesc, 155);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: title,
    description,
    about: `Protecting your car during ${s.display}`,
  };
  const bodyHtml = bodyScenario({ displayName: s.display, data: s, slug });
  const html = injectMetaBody(baseHtml, { title, description, canonical, ogTitle: title, ogDesc: description, jsonLd, bodyHtml });
  writePage(`scenario/${slug}`, 'index.html', html);
  pages.push(canonical);
  console.log(`  ✓ /scenario/${slug}`);
}

// ── 8. Top-level pages (6 pages) ────────────────────────────────
const TOP_PAGES = {
  'how-it-works': {
    title: 'How CarShake Works — AI-Powered Car Protection',
    description: 'Scan your car in 60 seconds. QR handover proof. AI compares every angle at pickup. Free, no app download needed.',
    h1: 'How CarShake Works'
  },
  'faq': {
    title: 'Frequently Asked Questions — CarShake',
    description: 'Everything you need to know about CarShake: pricing, how scans work, QR handover, legal evidence, and more.',
    h1: 'Frequently Asked Questions'
  },
  'pricing': {
    title: 'CarShake Pricing — Free Valet Protection',
    description: 'Free plan includes 3 scans per month. Shield+ at $2.97/month for unlimited scans, PDF reports, and priority support.',
    h1: 'Simple, Transparent Pricing'
  },
  'trust': {
    title: 'Trust & Security — CarShake',
    description: 'SHA-256 hashing, GPS verification, server timestamps. Your car condition data is secure and admissible as evidence.',
    h1: 'Trust & Security'
  },
  'compare': {
    title: 'CarShake vs The Alternatives — Why Evidence Matters',
    description: 'Why CarShake beats camera photos, dash cams, insurance claims, and valet inspections. The only tool with AI-verified, QR-confirmed, court-admissible documentation.',
    h1: 'Why CarShake Beats Every Alternative',
    body: `${headerHtml()}
<main class="cs-container cs-section">
  <nav class="cs-breadcrumb">
    <a href="/">Home</a> / <span>Compare</span>
  </nav>
  <h1 class="cs-h1">Why CarShake Beats Every Other Option</h1>
  <p class="cs-body">There are six common approaches to protecting your car at valet. Only one gives you court-ready, mutually confirmed evidence in 60 seconds. Here's how they stack up.</p>
  <div class="cs-stack cs-stack-md" style="margin-bottom:var(--cs-space-4)">
${COMPARE_CATEGORIES.map(function(c) {
  return `    <div class="cs-card">
      <h2 style="font-size:1.125rem;font-weight:700;margin:0 0 var(--cs-space-3)">${c.name}</h2>
      <div style="margin-bottom:var(--cs-space-2)"><p style="font-size:0.8125rem;font-weight:600;color:var(--cs-error);margin:0 0 0.25rem">What they say:</p><p class="cs-body-sm">${c.whatTheySay}</p></div>
      <div style="margin-bottom:var(--cs-space-2)"><p style="font-size:0.8125rem;font-weight:600;color:var(--cs-warning);margin:0 0 0.25rem">What they miss:</p><p class="cs-body-sm">${c.whatTheyMiss}</p></div>
      <div><p style="font-size:0.8125rem;font-weight:600;color:var(--cs-success);margin:0 0 0.25rem">CarShake verdict:</p><p class="cs-body-sm">${c.verdict}</p></div>
    </div>`;
}).join('\n')}
  </div>
  ${brunsonLeadSection()}
  ${brunsonCTA()}
</main>
${movementHtml()}`
  },
  'blog': {
    title: 'Valet Parking Protection Blog — CarShake',
    description: 'Tips, guides, and updates about valet parking protection, car damage prevention, and AI-powered documentation.',
    h1: 'CarShake Blog',
    body: `${headerHtml()}
<main class="cs-container cs-section">
  <h1 class="cs-h1">CarShake Blog</h1>
  <p class="cs-body">Real talk about valet parking protection, preventing damage disputes, and how to never pay for damage you didn't cause.</p>
${BLOG_POSTS.map(p => `  <a href="${p.url}" class="cs-card cs-card-interactive" style="margin-bottom:var(--cs-space-3)">
    <p style="font-size:0.75rem;color:var(--cs-gold);font-weight:600;margin:0 0 0.25rem">${p.date}</p>
    <h2 style="font-size:1.125rem;font-weight:700;margin:0 0 var(--cs-space-1);font-family:var(--cs-font-display)">${p.title}</h2>
    <p class="cs-body-sm" style="margin:0">${p.excerpt}</p>
  </a>`).join('\n')}
</main>
${movementHtml()}`
  },
};

for (const [slug, tp] of Object.entries(TOP_PAGES)) {
  const canonical = `${SITE}/${slug}`;
  const title = truncate(tp.title, 60);
  const description = truncate(tp.description, 155);
  const bodyHtml = tp.body || `${headerHtml()}
<main class="cs-container cs-section">
  <h1 class="cs-h1">${tp.h1}</h1>
  <p class="cs-body" style="font-size:1.1rem;color:var(--cs-text);margin-bottom:var(--cs-space-4)"><strong>${tp.description}</strong></p>
  ${slug === 'pricing' ? '' : brunsonStorySection()}
  ${brunsonLeadSection()}
  ${brunsonCTA()}
</main>
${movementHtml()}`;
  const html = injectMetaBody(baseHtml, { title, description, canonical, ogTitle: title, ogDesc: description, bodyHtml });
  writePage(slug, 'index.html', html);
  pages.push(canonical);
  console.log(`  ✓ /${slug}`);
}

// ── 9. Blog post pages (6 pages) ────────────────────────────────
for (const post of BLOG_POSTS) {
  const slug = post.url.split('/').pop();
  const canonical = `${SITE}/blog/${slug}`;
  const title = truncate(post.title + ' — CarShake', 60);
  const description = truncate(post.excerpt, 155);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: new Date(post.date).toISOString(),
    author: { '@type': 'Person', name: 'CarShake Team' },
  };
  const bodyHtml = `${headerHtml()}
<main class="cs-container cs-section">
  <p class="cs-body-sm" style="margin-bottom:var(--cs-space-2)"><a href="/blog" class="cs-movement-link">&larr; Back to Blog</a></p>
  <p style="font-size:0.75rem;color:var(--cs-gold);font-weight:600;margin:0 0 var(--cs-space-1)">${post.date}</p>
  ${post.body}
  ${brunsonLeadSection()}
  ${brunsonCTA("Try CarShake — Free", "/#demo", "60 seconds. 8 angles. AI-verified.")}
</main>
${movementHtml()}`;
  const html = injectMetaBody(baseHtml, { title, description, canonical, ogTitle: title, ogDesc: description, jsonLd, bodyHtml });
  writePage(`blog/${slug}`, 'index.html', html);
  pages.push(canonical);
  console.log(`  ✓ /blog/${slug}`);
}

// ── Sitemap generation ────────────────────────────────────────────
// Custom static pages (served via Vercel rewrite, not prerendered)
pages.push('https://carshake.online/about');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
${pages.map(url => `  <url><loc>${url}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n')}
</urlset>`;
writeFileSync(resolve(DIST, 'sitemap.xml'), sitemap, 'utf8');
console.log(`\n✓ Sitemap written (${pages.length + 1} URLs)`);
console.log(`✓ TOTAL: ${pages.length} prerendered pages`);
