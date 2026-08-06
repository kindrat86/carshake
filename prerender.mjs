#!/usr/bin/env node
/**
 * CarShake SEO Prerender Script
 * 
 * Generates static HTML files for all pSEO page types so crawlers
 * see full content, meta tags, and JSON-LD instead of a client-side shell.
 * 
 * Run after `npm run build`.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const DIST = resolve(import.meta.dirname, '.');
const SITE = 'https://carshake.online';

// ── Load the base HTML template from dist (production build) ──────────
let baseHtml = readFileSync(resolve(DIST, 'dist', 'index.html'), 'utf8');

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

  // Replace OG url
  html = html.replace(
    /<meta property="og:url"[^>]*\/?>/,
    `<meta property="og:url" content="${canonical}">`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical"[^>]*\/?>/,
    `<link rel="canonical" href="${canonical}" />`
  );

  // Remove existing chart/supabase modulepreloads on all pages (they slow down non-dashboard pages)
  // Keep them for page that need them — but prerender pages don't need modulepreloads at all
  // Actually keep the JS bundle so the SPA still works when clicked through
  // just strip supabase modulepreload (174K) and charts (142K) for pSEO pages
  // ... on second thought, keep them all — the user expects the SPA to work

  // Inject JSON-LD before </head>
  if (jsonLd) {
    const jsonLdHtml = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n`;
    html = html.replace('</head>', jsonLdHtml + '</head>');
  }

  // Inject prerendered body content into <div id="root">
  if (bodyHtml) {
    html = html.replace(
      /<div id="root">[\s\S]*?<\/div>/,
      `<div id="root">${bodyHtml}</div>`
    );
  }

  return html;
}

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

const SCENARIOS = {
  'parallel-parking': { display: 'Parallel Parking', title: 'Protect Your Car During Parallel Parking — CarShake', metaDesc: 'Parallel parking causes bumper scrapes, curb rash, and mirror damage. AI-verified documentation before you park.', paragraphs: ['Parallel parking is one of the highest-risk maneuvers for vehicle damage. Curb rash on alloy wheels, front bumper scrapes, rear bumper contact, and side mirror folding are all common outcomes. In cities like San Francisco, New York, and Boston where parallel parking is the norm, drivers accept these risks daily.', 'The problem is proving damage occurred during parking, not before. A fresh curb scrape looks the same as an old one. Without documented proof of your car\'s pre-parking condition, you can\'t hold anyone accountable for new damage.', 'CarShake solves this. Before you parallel park anywhere, take 60 seconds to scan your car. When you return, scan again. AI comparison flags new curb rash, bumper scrapes, or mirror damage.'] },
  'valet-parking-scenario': { display: 'Valet Parking', title: 'Protect Your Car at Valet Parking — Full Guide', metaDesc: 'Complete guide to valet parking protection. AI-verified scans, QR handover proof, and AI comparison at pickup.', paragraphs: ['Valet parking combines all the risks of parking with the complication of a third party handling your vehicle. When you hand your keys to a valet, you\'re entering an implicit bailment agreement.', 'Most valet tickets include liability disclaimers. Even with those, gross negligence cannot be disclaimed. But without proof of your car\'s condition before the valet took it, you have no foundation for any claim.', 'CarShake creates that foundation in 60 seconds. The QR-based handover creates a mutual digital signature. AI comparison at pickup catches every new scratch, dent, and ding.'] },
  'parking-lot': { display: 'Parking Lot', title: 'Protect Your Car in Any Parking Lot — CarShake', metaDesc: 'Parking lots cause door dings, shopping cart damage, and bumper bumps. Document before parking.', paragraphs: ['Parking lots are the #1 location for vehicle damage in America. Door dings from adjacent cars, shopping cart collisions, bumper bumps from poorly parked vehicles — and no attendant to hold accountable.', 'Insurance claims for parking lot damage are notoriously difficult because you can rarely prove when it happened. A door ding could have been there for weeks.', 'CarShake gives you the evidence you need. Document your car before entering any parking lot. The 60-second scan creates a complete record. AI comparison catches new damage instantly.'] },
  'night-parking': { display: 'Night Parking', title: 'Night Parking Protection — CarShake', metaDesc: 'Parking at night increases damage risk. AI-verified car scans work in low light.', paragraphs: ['Parking at night introduces unique risks: reduced visibility, tired drivers with impaired judgment, dimly lit parking structures, and the inability to inspect your car properly at pickup.', 'Street parking overnight is especially risky. Hit-and-run damage, vandalism, and parking structure collisions are more common at night.', 'CarShake works in low-light conditions. Document your car before parking for the night, and scan again in the morning. The AI comparison works regardless of lighting conditions.'] },
  'event-valet': { display: 'Event Valet', title: 'Event Valet Parking Protection — CarShake', metaDesc: 'High-volume event valet needs extra protection. AI-verified documentation for weddings, galas, and events.', paragraphs: ['Event valet — at weddings, galas, fundraisers, and corporate events — involves high volumes of vehicles in compressed timeframes. Attendants are often temporary workers unfamiliar with the parking environment.', 'Thousands of cars pass through event valet operations. Exhausted drivers, dark parking areas, and rushed attendants create conditions where damage is more likely.', 'CarShake protects both you and the event. Document your car before handing over the keys. When you pick up, AI comparison catches every new scratch.'] },
  'tailgating': { display: 'Tailgating', title: 'Tailgating Parking Protection — CarShake', metaDesc: 'Tailgating parking is chaotic. Document before game day parking catches every new dent.', paragraphs: ['Tailgating parking lots are among the most hazardous environments for your vehicle. Thousands of fans, grills, coolers, and parked cars in grass fields or gravel lots create constant risk of damage.', 'Tailgating damage is extremely common. Without documentation, you have no recourse.', 'CarShake gives you court-ready evidence. Scan before entering the lot, scan again after. AI catches every new dent, scratch, and scrape.'] },
};

// ── Body HTML generation ─────────────────────────────────────────

function bodyCity({ displayName, city, slug }) {
  return `<div style="min-height:100vh;background:#FAFAF8;color:#3F3F46;font-family:'DM Sans',sans-serif">
<header style="padding:1rem;border-bottom:1px solid #E4E4E7;background:white">
<a href="/" style="font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:#C9A237;text-decoration:none">CarShake</a>
<a href="/city" style="margin-left:1rem;font-size:0.875rem;color:#6B7280;text-decoration:none">← City Guides</a>
</header>
<main style="max-width:720px;margin:0 auto;padding:2rem 1rem">
<nav style="font-size:0.75rem;margin-bottom:1.5rem">
<a href="/" style="color:#C9A237;text-decoration:none">Home</a> / <a href="/city" style="color:#C9A237;text-decoration:none">City Guides</a> / <span style="color:#3F3F46">${displayName}</span>
</nav>
<h1 style="font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:700;margin-bottom:1.5rem;line-height:1.3">Protect Your Car at Valet Parking in ${displayName}</h1>
<p style="font-size:0.9375rem;line-height:1.7;margin-bottom:1.25rem">${displayName}, ${city.state} is ${city.parkingNotable}. When you hand your keys to a valet, you're trusting someone with a vehicle worth thousands of dollars. Without documented proof of your car's condition before the handover, you have no defense if damage appears at pickup.</p>
<p style="font-size:0.9375rem;line-height:1.7;margin-bottom:1.25rem">CarShake creates a signed, timestamped, AI-verified record of your car's condition in 60 seconds — right from your phone, no app download needed. The parking attendant scans your QR code and confirms. Both sides sign. Both sides are protected.</p>
<p style="font-size:0.9375rem;line-height:1.7;margin-bottom:1.25rem">With a population of ${city.population}, ${displayName} has thousands of daily valet interactions. CarShake gives ${displayName} drivers peace of mind that every scratch, dent, and ding is documented before anyone else touches your car.</p>
<div style="margin:2.5rem 0;padding:1.5rem;border:2px solid #C9A237;border-radius:14px;background:#FFF8E7;text-align:center">
<p style="font-family:'Playfair Display',serif;font-size:1.125rem;font-weight:700;margin-bottom:0.5rem;color:#3F3F46">Try CarShake in ${displayName} — it's free.</p>
<p style="font-size:0.875rem;color:#6B7280;margin-bottom:1rem">60 seconds. 8 photos. AI-verified protection.</p>
<a href="/#demo" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 1.5rem;border-radius:12px;background:#C9A237;color:white;font-weight:600;text-decoration:none;font-size:0.875rem">See the AI Protection in Action — Free</a>
</div>
<h2 style="font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;margin-bottom:1rem">Valet Scenarios in ${displayName}</h2>
<div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:2.5rem">
<a href="/protect/valet-parking" style="display:block;background:white;border-radius:14px;border:1px solid #E4E4E7;padding:1rem;text-decoration:none;color:inherit"><h3 style="font-weight:700;font-size:0.9375rem;margin:0 0 0.25rem">Valet Parking Protection</h3><p style="font-size:0.875rem;color:#6B7280;margin:0">How to document your car before handing keys to a valet attendant</p></a>
<a href="/protect/hotel-parking" style="display:block;background:white;border-radius:14px;border:1px solid #E4E4E7;padding:1rem;text-decoration:none;color:inherit"><h3 style="font-weight:700;font-size:0.9375rem;margin:0 0 0.25rem">Hotel Parking Protection</h3><p style="font-size:0.875rem;color:#6B7280;margin:0">Protect your car during hotel stays and overnight valet parking</p></a>
<a href="/protect/airport-parking" style="display:block;background:white;border-radius:14px;border:1px solid #E4E4E7;padding:1rem;text-decoration:none;color:inherit"><h3 style="font-weight:700;font-size:0.9375rem;margin:0 0 0.25rem">Airport Parking Protection</h3><p style="font-size:0.875rem;color:#6B7280;margin:0">Document your car before long-term airport parking in ${displayName}</p></a>
</div>
<p style="text-align:center"><a href="/city" style="color:#C9A237;font-weight:600;font-size:0.875rem">← All City Guides</a></p>
</main>
<footer style="background:#1C1C1E;padding:2rem 1rem;text-align:center">
<p style="font-family:'Playfair Display',serif;color:#C9A237;font-size:1.125rem;font-weight:700;margin:0 0 0.25rem">CarShake</p>
<p style="color:#9CA3AF;font-size:0.875rem;margin:0">© 2026 CarShake · carshake.online</p>
</footer>
</div>`;
}

function bodyState({ displayName, data, slug }) {
  return `<div style="min-height:100vh;background:#FAFAF8;color:#3F3F46;font-family:'DM Sans',sans-serif">
<header style="padding:1rem;border-bottom:1px solid #E4E4E7;background:white"><a href="/" style="font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:#C9A237;text-decoration:none">CarShake</a></header>
<main style="max-width:720px;margin:0 auto;padding:2rem 1rem">
<h1 style="font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:700;margin-bottom:1rem;line-height:1.3">Valet Parking Liability Laws in ${displayName}</h1>
<div style="margin-bottom:2rem">
<div style="background:white;border-radius:14px;border:1px solid #E4E4E7;padding:1.25rem;margin-bottom:1rem">
<h2 style="font-size:1rem;font-weight:700;margin:0 0 0.5rem">Governing Bailment Law</h2>
<p style="font-size:0.875rem;color:#6B7280;margin:0">${data.bailmentLaw}</p>
</div>
<div style="background:white;border-radius:14px;border:1px solid #E4E4E7;padding:1.25rem;margin-bottom:1rem">
<h2 style="font-size:1rem;font-weight:700;margin:0 0 0.5rem">Statute of Limitations</h2>
<p style="font-size:0.875rem;color:#6B7280;margin:0">You have <strong>${data.statuteOfLimitations}</strong> to file a claim for valet parking damage in ${displayName}.</p>
</div>
<div style="background:white;border-radius:14px;border:1px solid #E4E4E7;padding:1.25rem">
<h2 style="font-size:1rem;font-weight:700;margin:0 0 0.5rem">Notable Application</h2>
<p style="font-size:0.875rem;color:#6B7280;margin:0">${data.notableCase}</p>
</div>
</div>
<div style="background:#FFF8E7;border:2px solid #C9A237;border-radius:14px;padding:1.5rem;margin-bottom:2rem">
<h2 style="font-size:1.125rem;font-weight:700;margin:0 0 0.75rem">Why evidence matters in ${displayName}</h2>
<p style="font-size:0.875rem;color:#6B7280;margin-bottom:1rem">Legal rights don't matter unless you can prove when damage occurred. CarShake creates GPS-verified, timestamped, SHA-256 hashed evidence of your car's condition before and after valet parking — admissible evidence that changes the outcome of disputes.</p>
<a href="/#demo" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 1.5rem;border-radius:12px;background:#C9A237;color:white;font-weight:600;text-decoration:none;font-size:0.875rem">Get Proof Before You Park — Free</a>
</div>
<p style="text-align:center"><a href="/" style="color:#C9A237;font-weight:600;font-size:0.875rem">← Back to CarShake Home</a></p>
</main>
<footer style="background:#1C1C1E;padding:2rem 1rem;text-align:center">
<p style="color:#C9A237;font-size:1.125rem;font-weight:700;margin:0 0 0.25rem">CarShake</p>
<p style="color:#9CA3AF;font-size:0.875rem;margin:0">© 2026 CarShake · carshake.online</p>
</footer>
</div>`;
}

function bodyUsecase({ h1, paragraphs, slug, displayName }) {
  const paras = paragraphs.map(p => `<p style="font-size:0.9375rem;line-height:1.7;margin-bottom:1.25rem;color:#6B7280">${p}</p>`).join('\n');
  return `<div style="min-height:100vh;background:#FAFAF8;color:#3F3F46;font-family:'DM Sans',sans-serif">
<header style="padding:1rem;border-bottom:1px solid #E4E4E7;background:white"><a href="/" style="font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:#C9A237;text-decoration:none">CarShake</a></header>
<main style="max-width:720px;margin:0 auto;padding:2rem 1rem">
<h1 style="font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:700;margin-bottom:1.5rem;line-height:1.3">${h1}</h1>
${paras}
<div style="margin:2.5rem 0;padding:1.5rem;border:2px solid #C9A237;border-radius:14px;background:#FFF8E7;text-align:center">
<p style="font-weight:600;margin-bottom:0.5rem">Try CarShake — it's free.</p>
<a href="/#demo" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 1.5rem;border-radius:12px;background:#C9A237;color:white;font-weight:600;text-decoration:none;font-size:0.875rem">See AI Protection in Action</a>
</div>
</main>
<footer style="background:#1C1C1E;padding:2rem 1rem;text-align:center">
<p style="color:#C9A237;font-size:1.125rem;font-weight:700;margin:0 0 0.25rem">CarShake</p>
<p style="color:#9CA3AF;font-size:0.875rem;margin:0">© 2026 CarShake · carshake.online</p>
</footer>
</div>`;
}

function bodyVehicle({ displayName, data, slug }) {
  const paras = data.paragraphs.map(p => `<p style="font-size:0.9375rem;line-height:1.7;margin-bottom:1.25rem;color:#6B7280">${p}</p>`).join('\n');
  return `<div style="min-height:100vh;background:#FAFAF8;color:#3F3F46;font-family:'DM Sans',sans-serif">
<header style="padding:1rem;border-bottom:1px solid #E4E4E7;background:white"><a href="/" style="font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:#C9A237;text-decoration:none">CarShake</a></header>
<main style="max-width:720px;margin:0 auto;padding:2rem 1rem">
<h1 style="font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:700;margin-bottom:1.5rem;line-height:1.3">${data.title}</h1>
${paras}
<div style="margin:2.5rem 0;padding:1.5rem;border:2px solid #C9A237;border-radius:14px;background:#FFF8E7;text-align:center">
<p style="font-weight:600;margin-bottom:0.5rem">Try CarShake — it's free.</p>
<a href="/#demo" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 1.5rem;border-radius:12px;background:#C9A237;color:white;font-weight:600;text-decoration:none;font-size:0.875rem">See AI Protection in Action</a>
</div>
</main>
<footer style="background:#1C1C1E;padding:2rem 1rem;text-align:center">
<p style="color:#C9A237;font-size:1.125rem;font-weight:700;margin:0 0 0.25rem">CarShake</p>
<p style="color:#9CA3AF;font-size:0.875rem;margin:0">© 2026 CarShake · carshake.online</p>
</footer>
</div>`;
}

function bodyScenario({ displayName, data, slug }) {
  const paras = data.paragraphs.map(p => `<p style="font-size:0.9375rem;line-height:1.7;margin-bottom:1.25rem;color:#6B7280">${p}</p>`).join('\n');
  return `<div style="min-height:100vh;background:#FAFAF8;color:#3F3F46;font-family:'DM Sans',sans-serif">
<header style="padding:1rem;border-bottom:1px solid #E4E4E7;background:white"><a href="/" style="font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:#C9A237;text-decoration:none">CarShake</a></header>
<main style="max-width:720px;margin:0 auto;padding:2rem 1rem">
<h1 style="font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:700;margin-bottom:1.5rem;line-height:1.3">${data.title}</h1>
${paras}
<div style="margin:2.5rem 0;padding:1.5rem;border:2px solid #C9A237;border-radius:14px;background:#FFF8E7;text-align:center">
<p style="font-weight:600;margin-bottom:0.5rem">Try CarShake — it's free.</p>
<a href="/#demo" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 1.5rem;border-radius:12px;background:#C9A237;color:white;font-weight:600;text-decoration:none;font-size:0.875rem">See AI Protection in Action</a>
</div>
</main>
<footer style="background:#1C1C1E;padding:2rem 1rem;text-align:center">
<p style="color:#C9A237;font-size:1.125rem;font-weight:700;margin:0 0 0.25rem">CarShake</p>
<p style="color:#9CA3AF;font-size:0.875rem;margin:0">© 2026 CarShake · carshake.online</p>
</footer>
</div>`;
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
  const bodyHtml = `<div style="min-height:100vh;background:#FAFAF8;color:#3F3F46;font-family:'DM Sans',sans-serif">
<header style="padding:1.5rem 1rem;border-bottom:1px solid #E4E4E7;background:white;max-width:768px;margin:0 auto">
<a href="/" style="font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:#C9A237;text-decoration:none;display:block;margin-bottom:1rem">CarShake</a>
<h1 style="font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:700;margin:0 0 0.25rem">City Valet Protection Guides</h1>
<p style="font-size:0.9375rem;color:#6B7280;margin:0">Protect your car at valet parking in cities across America</p>
</header>
<main style="max-width:768px;margin:0 auto;padding:2rem 1rem">
<div style="display:grid;gap:0.75rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">
${CITIES_LIST.map(c => `<a href="/city/${c.slug}" style="display:block;background:white;border-radius:14px;border:1px solid #E4E4E7;padding:1rem;text-decoration:none;color:inherit"><h2 style="font-size:1rem;font-weight:700;margin:0 0 0.25rem">${c.display}</h2><p style="font-size:0.75rem;color:#6B7280;margin:0">${c.state}</p></a>`).join('\n')}
</div>
<div style="margin:3rem 0;padding:1.5rem;border:2px solid #C9A237;border-radius:14px;background:#FFF8E7;text-align:center">
<p style="font-weight:700;margin-bottom:0.5rem">Your city not listed?</p>
<p style="font-size:0.875rem;color:#6B7280;margin-bottom:1rem">CarShake works everywhere.</p>
<a href="/#demo" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 1.5rem;border-radius:12px;background:#C9A237;color:white;font-weight:600;text-decoration:none">Try CarShake — Free</a>
</div>
</main>
<footer style="background:#1C1C1E;padding:2rem 1rem;text-align:center"><p style="color:#C9A237;font-weight:700;margin:0">CarShake</p><p style="color:#9CA3AF;font-size:0.875rem;margin:0.25rem 0 0">© 2026 CarShake</p></footer>
</div>`;
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
  const bodyHtml = `<div style="min-height:100vh;background:#FAFAF8;color:#3F3F46;font-family:'DM Sans',sans-serif">
<header style="padding:1.5rem 1rem;border-bottom:1px solid #E4E4E7;background:white;max-width:768px;margin:0 auto">
<a href="/" style="font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:#C9A237;text-decoration:none;display:block;margin-bottom:1rem">CarShake</a>
<h1 style="font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:700;margin:0 0 0.25rem">Vehicle-Specific Valet Guides</h1>
<p style="font-size:0.9375rem;color:#6B7280;margin:0">Protect your specific vehicle type at valet parking</p>
</header>
<main style="max-width:768px;margin:0 auto;padding:2rem 1rem">
<div style="display:grid;gap:0.75rem;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">
${VEHICLE_LIST.map(v => `<a href="/vehicle/${v.slug}" style="display:block;background:white;border-radius:14px;border:1px solid #E4E4E7;padding:1rem;text-decoration:none;color:inherit"><h2 style="font-size:1rem;font-weight:700;margin:0 0 0.25rem">${v.display}</h2><p style="font-size:0.75rem;color:#6B7280;margin:0">${v.desc}</p></a>`).join('\n')}
</div>
</main>
<footer style="background:#1C1C1E;padding:2rem 1rem;text-align:center"><p style="color:#C9A237;font-weight:700;margin:0">CarShake</p></footer>
</div>`;
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

// ── 8. Top-level pages (5 pages) ────────────────────────────────
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
    title: 'CarShake Pricing — $2.97 Founder Price Valet Protection',
    description: 'Free for 3 scans/month. Shield+ at $2.97 founding price locked forever for unlimited scans, AI comparison, court-ready PDF reports. Pro at $19.97 for operators.',
    h1: 'Protection pricing that pays for itself'
  },
  'trust': {
    title: 'Trust & Security — CarShake',
    description: 'SHA-256 hashing, GPS verification, server timestamps. Your car condition data is secure and admissible as evidence.',
    h1: 'Trust & Security'
  },
  'blog': {
    title: 'Valet Parking Protection Blog — CarShake',
    description: 'Tips, guides, and updates about valet parking protection, car damage prevention, and AI-powered documentation.',
    h1: 'CarShake Blog'
  },
};

for (const [slug, tp] of Object.entries(TOP_PAGES)) {
  const canonical = `${SITE}/${slug}`;
  const title = truncate(tp.title, 60);
  const description = truncate(tp.description, 155);
  const bodyHtml = `<div style="min-height:100vh;background:#FAFAF8;color:#3F3F46;font-family:'DM Sans',sans-serif">
<header style="padding:1rem;border-bottom:1px solid #E4E4E7;background:white"><a href="/" style="font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:#C9A237;text-decoration:none">CarShake</a></header>
<main style="max-width:720px;margin:0 auto;padding:2rem 1rem">
<h1 style="font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:700;margin-bottom:1.5rem">${tp.h1}</h1>
<p style="font-size:0.9375rem;line-height:1.7;color:#6B7280">${tp.description}</p>
<div style="margin:2.5rem 0;padding:1.5rem;border:2px solid #C9A237;border-radius:14px;background:#FFF8E7;text-align:center">
<a href="/#demo" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 1.5rem;border-radius:12px;background:#C9A237;color:white;font-weight:600;text-decoration:none">Try CarShake — Free</a>
</div>
</main>
<footer style="background:#1C1C1E;padding:2rem 1rem;text-align:center"><p style="color:#C9A237;font-weight:700;margin:0">CarShake</p></footer>
</div>`;
  const html = injectMetaBody(baseHtml, { title, description, canonical, ogTitle: title, ogDesc: description, bodyHtml });
  writePage(slug, 'index.html', html);
  pages.push(canonical);
  console.log(`  ✓ /${slug}`);
}

// ── Sitemap generation ────────────────────────────────────────────
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
${pages.map(url => `  <url><loc>${url}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n')}
</urlset>`;
writeFileSync(resolve(DIST, 'sitemap.xml'), sitemap, 'utf8');
console.log(`\n✓ Sitemap written (${pages.length + 1} URLs)`);
console.log(`✓ TOTAL: ${pages.length} prerendered pages`);
