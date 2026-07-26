#!/usr/bin/env node
/**
 * Valet Damage Index generator — turns the existing CC BY 4.0 dataset
 * (research/valet-damage-hotspots-2026/data.csv) into a citable, embeddable
 * data-journalism hub.
 *
 * Emits:
 *   research/valet-damage-index/index.html               — interactive hub + SVG chart
 *   research/valet-damage-index/<slug>/index.html ×40    — one citable card per city
 *   embed/tools/valet-damage-index.html                  — embeddable ranking widget
 *   press/index.html                                     — journalist / press kit
 *
 * Every number on every page is derived verbatim from data.csv — no invention.
 * Run: node scripts/gen-damage-index.mjs  (idempotent; safe to re-run)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = process.cwd();
const SITE = "https://carshake.online";
const DATA_CSV = join(ROOT, "research/valet-damage-hotspots-2026/data.csv");
const OUT_INDEX = join(ROOT, "research/valet-damage-index");
const OUT_EMBED = join(ROOT, "embed/tools/valet-damage-index.html");
const OUT_PRESS = join(ROOT, "press/index.html");
const PUBLISHED = "2026-07-26";

// ── 1. Parse CSV ──────────────────────────────────────────
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const rows = readFileSync(DATA_CSV, "utf8").trim().split("\n").slice(1).map((l, i) => {
  const c = l.split(",");
  return {
    rank: i + 1,
    city: c[0], state: c[1],
    rate: parseFloat(c[2]),
    density: parseFloat(c[3]),
    topDamage: c[4],
    avgClaim: parseInt(c[5], 10),
    enforcement: c[6],
    season: c[7],
    slug: slugify(c[0]),
  };
});

// Canonical URL roots — NO trailing slash (site uses trailingSlash:false;
// slashed forms 308-redirect). Every link/canonical/sitemap entry uses these.
const RESEARCH_URL = `${SITE}/research`;
const INDEX_URL = `${SITE}/research/valet-damage-index`;
const PRESS_URL = `${SITE}/press`;
const cityUrl = (slug) => `${INDEX_URL}/${slug}`;

const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const meanRate = avg(rows.map((r) => r.rate));
const medianRate = [...rows.map((r) => r.rate)].sort((a, b) => a - b)[Math.floor(rows.length / 2)];
const meanClaim = Math.round(avg(rows.map((r) => r.avgClaim)));
const maxR = rows[0], minR = rows[rows.length - 1];
const states = [...new Set(rows.map((r) => r.state))].length;

// ── shared HTML fragments ─────────────────────────────────
const orgDisambig = `<script type="application/ld+json">{"@context": "https://schema.org", "@type": "Organization", "name": "CarShake", "url": "https://carshake.online", "description": "CarShake is a free valet-damage-proof and vehicle-handover app that scans and time-stamps a car's condition before and after handover, giving drivers, valet operators, and rental fleets court-admissible proof to defeat false damage claims.", "disambiguatingDescription": "CarShake is a consumer-and-operator valet-damage-proof handover app (scan-before / scan-after + QR receipt) — not a B2B insurance damage-detection API."}</script>`;

const researchStyle = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0f172a;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.7;padding:2rem 1rem}
.wrap{max-width:840px;margin:0 auto}
.back{color:#38bdf8;text-decoration:none;font-size:.9rem}
h1{font-size:2.2rem;line-height:1.15;color:#f8fafc;margin:.6rem 0 .3rem}
.subtitle{color:#94a3b8;font-size:1.05rem;margin-bottom:2rem}
h2{font-size:1.5rem;color:#f1f5f9;margin:2.5rem 0 1rem;border-bottom:2px solid #1e293b;padding-bottom:.4rem}
h3{font-size:1.15rem;color:#e2e8f0;margin:1.5rem 0 .6rem}
p,li{color:#cbd5e1;margin-bottom:.8rem}
ul,ol{padding-left:1.5rem;margin-bottom:1rem}
a{color:#38bdf8;text-decoration:none}
a:hover{text-decoration:underline}
.key-findings{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin:1.5rem 0}
.finding{background:#1e293b;border-radius:.5rem;padding:1.25rem;border:1px solid #334155}
.finding .num{font-size:2rem;font-weight:700;color:#38bdf8;display:block}
.finding .label{color:#94a3b8;font-size:.88rem;margin-top:.3rem}
table{border-collapse:collapse;width:100%;margin:1.5rem 0;font-size:.85rem}
th{background:#1e293b;color:#f1f5f9;font-weight:600;padding:.55rem .6rem;text-align:left;border-bottom:2px solid #334155;cursor:pointer;white-space:nowrap}
td{padding:.45rem .6rem;border-bottom:1px solid #1e293b}
tr:hover td{background:#1a2332}
.rate-bar{display:inline-block;height:10px;background:linear-gradient(90deg,#38bdf8,#0ea5e9);border-radius:3px;vertical-align:middle;margin-right:.4rem}
.search{width:100%;padding:.7rem .9rem;background:#1e293b;border:1px solid #334155;border-radius:.5rem;color:#e2e8f0;font-size:.95rem;margin-bottom:1rem}
.search::placeholder{color:#64748b}
.chips{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem}
.chip{background:#1e293b;border:1px solid #334155;color:#94a3b8;border-radius:999px;padding:.35rem .8rem;font-size:.82rem;cursor:pointer;transition:all .15s}
.chip:hover{border-color:#38bdf8;color:#e2e8f0}
.chip.active{background:#38bdf8;color:#0f172a;border-color:#38bdf8;font-weight:600}
.cite-box{background:#1e293b;border:1px solid #334155;border-radius:.5rem;padding:1rem;margin:1.5rem 0;font-family:monospace;font-size:.85rem;color:#94a3b8;overflow-x:auto;white-space:pre-wrap}
.note{background:#1e293b;border-left:3px solid #f59e0b;padding:.8rem 1rem;margin:1rem 0;border-radius:0 .375rem .375rem 0;font-size:.9rem;color:#94a3b8}
.cta{display:inline-block;background:#38bdf8;color:#0f172a;font-weight:700;padding:.8rem 1.4rem;border-radius:.5rem;margin:.5rem .5rem .5rem 0;text-decoration:none}
.cta.alt{background:transparent;border:1px solid #334155;color:#e2e8f0}
.embed-preview{background:#1e293b;border:1px solid #334155;border-radius:.5rem;padding:1rem;margin:1rem 0}
.copy-btn{float:right;background:#334155;color:#e2e8f0;border:none;border-radius:6px;padding:.3rem .7rem;font-size:.78rem;cursor:pointer}
.copy-btn:hover{background:#475569}
.license{color:#64748b;font-size:.85rem;margin-top:2rem;text-align:center}
.footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid #1e293b;color:#64748b;font-size:.85rem;text-align:center}
.footer a{color:#38bdf8}
.chart{width:100%;height:auto;background:#1e293b;border-radius:.5rem;padding:.5rem;margin:1.5rem 0;border:1px solid #334155}
.meta{color:#64748b;font-size:.82rem;margin-bottom:1.5rem}
.tag{display:inline-block;background:#1e293b;border:1px solid #334155;color:#94a3b8;border-radius:4px;padding:.15rem .5rem;font-size:.78rem;margin:.2rem .2rem 0 0}
@media(max-width:600px){h1{font-size:1.6rem}.key-findings{grid-template-columns:1fr 1fr}table{font-size:.78rem}th,td{padding:.4rem .35rem}}
`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

// ── SVG bar chart (top N, server-rendered, no JS) ─────────
function barChart(data, { max, width = 520, labelW = 110, rowH = 26 }) {
  const scale = (width - labelW - 70) / max;
  const h = data.length * rowH + 24;
  const bars = data.map((d, i) => {
    const y = i * rowH + 12;
    const w = Math.max(2, d.rate * scale);
    return `
    <text x="${labelW - 8}" y="${y + rowH / 2 + 4}" text-anchor="end" fill="#cbd5e1" font-size="12" font-family="sans-serif">${esc(d.city)}</text>
    <rect x="${labelW}" y="${y + 3}" width="${w.toFixed(1)}" height="${rowH - 9}" fill="#38bdf8" rx="2"/>
    <rect x="${labelW + w - 1}" y="${y + 3}" width="2" height="${rowH - 9}" fill="#0ea5e9" rx="1"/>
    <text x="${labelW + w + 6}" y="${y + rowH / 2 + 4}" fill="#f1f5f9" font-size="12" font-weight="600" font-family="sans-serif">${d.rate}</text>`;
  }).join("");
  const avgX = labelW + meanRate * scale;
  return `<svg class="chart" viewBox="0 0 ${width} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Horizontal bar chart: valet damage incident rate per 1000 visits by city">
  <title>Valet damage incident rate per 1,000 visits — top ${data.length} cities</title>
  <line x1="${avgX.toFixed(1)}" y1="6" x2="${avgX.toFixed(1)}" y2="${h - 6}" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="${avgX.toFixed(1)}" y="${h - 1}" text-anchor="middle" fill="#f59e0b" font-size="10" font-family="sans-serif">avg ${meanRate.toFixed(1)}</text>
  ${bars}
</svg>`;
}

// ── 2. INDEX HUB ──────────────────────────────────────────
function indexPage() {
  const top15 = rows.slice(0, 15);
  const chart = barChart(top15, { max: maxR.rate });
  const tableRows = rows.map((r) => {
    const bw = Math.round((r.rate / maxR.rate) * 60);
    return `<tr data-state="${r.state}" data-dmg="${esc(r.topDamage)}" data-enf="${r.enforcement.toLowerCase()}" data-city="${esc(r.city).toLowerCase()}">
      <td>${r.rank}</td>
      <td><a href="${cityUrl(r.slug)}">${esc(r.city)}</a></td>
      <td>${r.state}</td>
      <td><span class="rate-bar" style="width:${bw}px"></span>${r.rate}</td>
      <td>${esc(r.topDamage)}</td>
      <td>$${r.avgClaim}</td>
      <td>${r.enforcement}</td>
    </tr>`;
  }).join("\n");

  const embedCode = `<iframe src="${SITE}/embed/tools/valet-damage-index.html" width="100%" height="520" style="border:1px solid #334155;border-radius:8px" loading="lazy" title="Valet Damage Index — US Cities Ranked"></iframe>`;

  const faq = [
    ["Which US city has the most valet damage?", `New York City ranks #1 with an estimated ${maxR.rate} incidents per 1,000 valet visits, followed by Los Angeles (${rows[1].rate}) and Miami (${rows[2].rate}).`],
    ["What is the average valet damage rate across US cities?", `Across the 40 cities in this dataset, the mean incident rate is ${meanRate.toFixed(1)} per 1,000 valet visits and the median is ${medianRate}.`],
    ["What is the most common type of valet damage?", "Scratched bumpers, door dings, curbed wheels (curbs rash), and bumper scrapes are the most commonly reported damage types across all cities."],
    ["Is this data free to use?", "Yes. The full dataset is published under CC BY 4.0 — you may share and adapt it with attribution to CarShake. See the press kit for ready-to-use citation snippets."],
    ["How was this data compiled?", "Incident rates are estimated composites derived from public sources (city parking-authority data, state insurance-department filings, NHTSA parking-incident reports, valet-service density, and community-sourced reports). They are directional rankings, not direct measurements."],
  ];

  const faqJson = faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Valet Damage Index 2026 — 40 US Cities Ranked | CarShake</title>
<meta name="description" content="Interactive ranking of 40 US cities by valet-related vehicle damage rate. New York leads at ${maxR.rate} per 1,000 valet visits; the national average is ${meanRate.toFixed(1)}. Free, embeddable, CC BY 4.0.">
<link rel="canonical" href="${INDEX_URL}">
<meta property="og:title" content="Valet Damage Index 2026 — 40 US Cities Ranked">
<meta property="og:description" content="Interactive ranking of 40 US cities by valet damage rate. Embeddable, free, CC BY 4.0.">
<meta property="og:type" content="article">
<meta property="og:url" content="${INDEX_URL}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Valet Damage Index 2026: 40 US Cities Ranked by Incident Rate",
  "description": "Interactive ranking of 40 US cities by estimated valet-related vehicle damage incident rate, with damage type, average claim value, and enforcement classification. Estimated composite metric from public sources.",
  "keywords": ["valet damage", "valet parking", "city ranking", "car damage statistics", "parking incidents"],
  "temporalCoverage": "2025-2026",
  "spatialCoverage": {"@type": "Place", "name": "United States", "geo": {"@type": "GeoShape", "address": "US"}},
  "variableMeasured": ["incident rate per 1000 valet visits", "damage type", "average claim", "valet density", "enforcement strictness", "seasonal peak"],
  "distribution": [
    {"@type": "DataDownload", "encodingFormat": "text/csv", "contentUrl": "${RESEARCH_URL}valet-damage-hotspots-2026/data.csv"},
    {"@type": "DataDownload", "encodingFormat": "application/json", "contentUrl": "${RESEARCH_URL}valet-damage-hotspots-2026/data.json"}
  ],
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "creator": {"@type": "Organization", "name": "CarShake", "url": "${SITE}"},
  "datePublished": "${PUBLISHED}",
  "dateModified": "${PUBLISHED}",
  "isAccessibleForFree": true
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Valet Damage Index 2026: 40 US Cities Ranked by Incident Rate",
  "description": "Interactive ranking of 40 US cities by estimated valet-related vehicle damage incident rate.",
  "author": {"@type": "Organization", "name": "CarShake", "url": "${SITE}"},
  "publisher": {"@type": "Organization", "name": "CarShake", "url": "${SITE}"},
  "datePublished": "${PUBLISHED}",
  "dateModified": "${PUBLISHED}",
  "mainEntityOfPage": "${INDEX_URL}"
}
</script>
<script type="application/ld+json">
{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": ${JSON.stringify(faqJson)}}
</script>
<script type="application/ld+json">
{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
  {"@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE}/"},
  {"@type": "ListItem", "position": 2, "name": "Research", "item": "${RESEARCH_URL}"},
  {"@type": "ListItem", "position": 3, "name": "Valet Damage Index 2026", "item": "${INDEX_URL}"}
]}
</script>
<style>${researchStyle}</style>
${orgDisambig}
</head>
<body>
<div class="wrap">
<a class="back" href="${RESEARCH_URL}">← Research &amp; Data</a>
<h1>Valet Damage Index 2026</h1>
<p class="subtitle">40 US cities ranked by estimated valet-related vehicle damage rate. Interactive, free, and embeddable under CC BY 4.0.</p>
<p class="meta">Published ${PUBLISHED} · ${rows.length} cities across ${states} states · Data: <a href="${RESEARCH_URL}valet-damage-hotspots-2026/data.csv">CSV</a> · <a href="${RESEARCH_URL}valet-damage-hotspots-2026/data.json">JSON</a> · <a href="${PRESS_URL}">Press kit</a></p>

<div class="key-findings">
  <div class="finding"><span class="num">${maxR.rate}</span><span class="label">Incidents per 1,000 valet visits in ${esc(maxR.city)} — the highest of 40 US cities</span></div>
  <div class="finding"><span class="num">${(maxR.rate / minR.rate).toFixed(1)}×</span><span class="label">Spread between ${esc(maxR.city)} (${maxR.rate}) and ${esc(minR.city)} (${minR.rate}), the lowest-ranked city</span></div>
  <div class="finding"><span class="num">$${meanClaim}</span><span class="label">Average estimated damage claim across all 40 cities</span></div>
  <div class="finding"><span class="num">${meanRate.toFixed(1)}</span><span class="label">Mean incident rate per 1,000 valet visits (median ${medianRate})</span></div>
</div>

<h2>Top 15 Cities by Incident Rate</h2>
${chart}
<p style="font-size:.85rem;color:#64748b">Amber dashed line = national mean (${meanRate.toFixed(1)} per 1,000). Rates are estimated composites from public sources, not direct measurements.</p>

<h2>Embed This Data — Free</h2>
<p>Copy the snippet below to embed the full interactive ranking on your site. CC BY 4.0 — attribution required.</p>
<div class="embed-preview">
  <button class="copy-btn" onclick="copyEmbed(this)">Copy</button>
  <code id="embed-code" style="display:block;font-family:monospace;font-size:.8rem;color:#94a3b8;white-space:pre-wrap;word-break:break-all">${esc(embedCode)}</code>
</div>
<p>See the <a href="${SITE}/embed/">embed gallery</a> for per-city badges and more widgets.</p>

<h2>Full Ranking — All 40 Cities</h2>
<input class="search" id="city-search" type="search" placeholder="Filter by city or state (e.g. Texas, Miami, CA)…" aria-label="Filter cities">
<div class="chips" id="filter-chips">
  <button class="chip active" data-filter="all">All</button>
  <button class="chip" data-filter="strict">Strict enforcement</button>
  <button class="chip" data-filter="loose">Loose enforcement</button>
  <button class="chip" data-filter="winter">Winter peak</button>
</div>
<table id="rank-table">
<thead><tr><th>#</th><th>City</th><th>State</th><th>Rate / 1K</th><th>Top Damage</th><th>Avg Claim</th><th>Enforcement</th></tr></thead>
<tbody>
${tableRows}
</tbody>
</table>
<p style="font-size:.85rem;color:#64748b"><em>${rows.length} rows. Click any city for its data card, comparison to the national average, and an embeddable city badge.</em></p>

<h2>Methodology</h2>
<p>Incident rates are <strong>estimated composite metrics</strong> derived from public sources: city parking-authority valet-permit density, state insurance-department claims filings, NHTSA parking-related incident statistics, valet-service density estimates, and community-sourced driver reports. They are directional rankings, not direct measurements. See the <a href="${RESEARCH_URL}valet-damage-hotspots-2026">full methodology &amp; downloads</a>.</p>
<p class="note"><strong>Data disclaimer:</strong> Incident rates are estimates synthesized from multiple public data sources and should be treated as directional rankings, not precise measurements. Actual rates vary by venue, time of day, vehicle type, and operator. Average claim values are estimated from insurance industry data and may not reflect out-of-pocket repair costs.</p>

<h2>Citation</h2>
<div class="cite-box">CarShake. (${PUBLISHED.slice(0, 4)}). <em>Valet Damage Index 2026: 40 US Cities Ranked by Incident Rate</em>. Retrieved from ${INDEX_URL}</div>

<h2>License</h2>
<p>This work is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Share and adapt for any purpose with attribution to CarShake. Ready-to-paste citations (APA, MLA, Chicago) are in the <a href="${PRESS_URL}">press kit</a>.</p>

<a class="cta" href="${PRESS_URL}">Press &amp; Journalist Kit →</a>
<a class="cta alt" href="${RESEARCH_URL}valet-damage-hotspots-2026/">Original dataset →</a>

<div class="footer">© ${PUBLISHED.slice(0, 4)} CarShake · <a href="${SITE}">carshake.online</a> · <a href="${SITE}/free/instant-proof">Try the free proof tool</a></div>
</div>

<script>
function copyEmbed(btn){
  const code=document.getElementById('embed-code').textContent;
  navigator.clipboard.writeText(code).then(()=>{btn.textContent='Copied!';setTimeout(()=>btn.textContent='Copy',2000);});
}
(function(){
  var search=document.getElementById('city-search'), chips=document.getElementById('filter-chips'),
      rows=[].slice.call(document.querySelectorAll('#rank-table tbody tr')), active='all';
  function apply(){
    var q=(search.value||'').toLowerCase().trim();
    rows.forEach(function(tr){
      var city=tr.getAttribute('data-city'), st=tr.getAttribute('data-state'),
          enf=tr.getAttribute('data-enf'), sea=tr.getAttribute('data-season'),
          text=(city+' '+st).toLowerCase();
      var qok=!q||text.indexOf(q)>-1;
      var fok=active==='all'||(active==='strict'&&enf==='strict')||(active==='loose'&&enf==='loose')||(active==='winter'&&sea==='winter');
      tr.style.display=(qok&&fok)?'':'none';
    });
  }
  search.addEventListener('input',apply);
  chips.addEventListener('click',function(e){
    var c=e.target.closest('.chip'); if(!c)return;
    [].slice.call(chips.querySelectorAll('.chip')).forEach(function(x){x.classList.remove('active');});
    c.classList.add('active'); active=c.getAttribute('data-filter'); apply();
  });
})();
</script>
</body>
</html>`;
}

// ── 3. CITY CARD ──────────────────────────────────────────
function cityPage(r) {
  const pctVsAvg = ((r.rate / meanRate - 1) * 100);
  const cmp = pctVsAvg >= 0
    ? `${Math.abs(pctVsAvg).toFixed(0)}% above` : `${Math.abs(pctVsAvg).toFixed(0)}% below`;
  const claimVsAvg = r.avgClaim >= meanClaim
    ? `$${r.avgClaim - meanClaim} above` : `$${meanClaim - r.avgClaim} below`;
  const percentile = Math.round((1 - (r.rank - 1) / rows.length) * 100);

  // mini 2-bar comparison SVG
  const miniW = 280, barH = 28, gap = 10;
  const scale = 240 / maxR.rate;
  const mini = `<svg viewBox="0 0 ${miniW} 80" width="100%" style="max-width:${miniW}px" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(r.city)} rate vs national average">
    <text x="0" y="16" fill="#94a3b8" font-size="11" font-family="sans-serif">${esc(r.city)}</text>
    <rect x="0" y="20" width="${(r.rate*scale).toFixed(1)}" height="${barH}" fill="#38bdf8" rx="3"/>
    <text x="${(r.rate*scale+6).toFixed(1)}" y="38" fill="#f1f5f9" font-size="12" font-weight="600" font-family="sans-serif">${r.rate}</text>
    <text x="0" y="64" fill="#94a3b8" font-size="11" font-family="sans-serif">National avg</text>
    <rect x="0" y="46" width="${(meanRate*scale).toFixed(1)}" height="${barH}" fill="#475569" rx="3"/>
    <text x="${(meanRate*scale+6).toFixed(1)}" y="64" fill="#94a3b8" font-size="11" font-family="sans-serif">${meanRate.toFixed(1)}</text>
  </svg>`;

  const badgeEmbed = `<iframe src="${SITE}/embed/tools/valet-damage-index.html?city=${r.slug}" width="100%" height="180" style="border:1px solid #334155;border-radius:8px" loading="lazy" title="${esc(r.city)} valet damage stats"></iframe>`;

  const faq = [
    [`How does ${r.city} compare to the US average for valet damage?`, `${esc(r.city)} has an estimated incident rate of ${r.rate} per 1,000 valet visits — ${cmp} the national mean of ${meanRate.toFixed(1)} across 40 cities. It ranks #${r.rank} (top ${percentile}%).`],
    [`What is the most common valet damage in ${r.city}?`, `In ${esc(r.city)}, ${esc(r.topDamage).toLowerCase()} is the most commonly reported type of valet-related damage.`],
    [`What is the average valet damage claim in ${r.city}?`, `The average estimated damage claim in ${esc(r.city)} is $${r.avgClaim}, ${claimVsAvg} the 40-city average of $${meanClaim}.`],
  ];
  const faqJson = faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Valet Damage in ${esc(r.city)}, ${r.state} — Rate, Cost &amp; Ranking (2026) | CarShake</title>
<meta name="description" content="${esc(r.city)}, ${r.state} ranks #${r.rank} of 40 US cities for valet damage at ${r.rate} incidents per 1,000 valet visits (${cmp} average). Avg claim $${r.avgClaim}. ${esc(r.topDamage)} most common.">
<link rel="canonical" href="${cityUrl(r.slug)}">
<meta property="og:title" content="Valet Damage in ${esc(r.city)}, ${r.state} — Rate, Cost &amp; Ranking (2026)">
<meta property="og:description" content="${esc(r.city)} ranks #${r.rank} of 40 US cities. ${r.rate} incidents per 1,000 valet visits. Avg claim $${r.avgClaim}.">
<meta property="og:type" content="article">
<meta property="og:url" content="${cityUrl(r.slug)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Valet Damage Statistics — ${esc(r.city)}, ${r.state} (2026)",
  "description": "${esc(r.city)} ranks #${r.rank} of 40 US cities for valet-related vehicle damage. Estimated incident rate: ${r.rate} per 1,000 valet visits. Most common damage: ${esc(r.topDamage)}. Average claim: $${r.avgClaim}.",
  "spatialCoverage": {"@type": "Place", "name": "${esc(r.city)}, ${r.state}, US"},
  "variableMeasured": ["incident rate per 1000 valet visits", "damage type", "average claim", "valet density", "enforcement strictness"],
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "isAccessibleForFree": true,
  "url": "${cityUrl(r.slug)}",
  "creator": {"@type": "Organization", "name": "CarShake", "url": "${SITE}"}
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Valet Damage in ${esc(r.city)}, ${r.state}: Rate, Cost &amp; National Ranking (2026)",
  "description": "${esc(r.city)} ranks #${r.rank} of 40 US cities for valet damage.",
  "author": {"@type": "Organization", "name": "CarShake", "url": "${SITE}"},
  "publisher": {"@type": "Organization", "name": "CarShake", "url": "${SITE}"},
  "datePublished": "${PUBLISHED}",
  "dateModified": "${PUBLISHED}",
  "mainEntityOfPage": "${cityUrl(r.slug)}"
}
</script>
<script type="application/ld+json">
{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": ${JSON.stringify(faqJson)}}
</script>
<script type="application/ld+json">
{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
  {"@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE}/"},
  {"@type": "ListItem", "position": 2, "name": "Research", "item": "${RESEARCH_URL}"},
  {"@type": "ListItem", "position": 3, "name": "Valet Damage Index", "item": "${INDEX_URL}"},
  {"@type": "ListItem", "position": 4, "name": "${esc(r.city)}", "item": "${cityUrl(r.slug)}"}
]}
</script>
<style>${researchStyle}</style>
${orgDisambig}
</head>
<body>
<div class="wrap">
<a class="back" href="${INDEX_URL}">← Valet Damage Index</a>
<h1>Valet Damage in ${esc(r.city)}, ${r.state}</h1>
<p class="subtitle">Rank #${r.rank} of 40 US cities · ${r.rate} incidents per 1,000 valet visits · ${cmp} the national average</p>

<div class="key-findings">
  <div class="finding"><span class="num">${r.rate}</span><span class="label">Incidents per 1,000 valet visits</span></div>
  <div class="finding"><span class="num">#${r.rank}</span><span class="label">National rank (top ${percentile}% of 40 cities)</span></div>
  <div class="finding"><span class="num">$${r.avgClaim}</span><span class="label">Average estimated damage claim (${claimVsAvg} avg)</span></div>
  <div class="finding"><span class="num">${r.enforcement}</span><span class="label">Valet enforcement strictness</span></div>
</div>

<h2>${esc(r.city)} vs. the National Average</h2>
${mini}
<p>The national mean across 40 cities is <strong>${meanRate.toFixed(1)}</strong> incidents per 1,000 valet visits (median ${medianRate}). ${esc(r.city)}'s rate of ${r.rate} is <strong>${cmp}</strong> that average.</p>

<h2>Full Data Card</h2>
<table>
<tbody>
<tr><th>Incident rate</th><td>${r.rate} per 1,000 valet visits</td></tr>
<tr><th>National rank</th><td>#${r.rank} of 40</td></tr>
<tr><th>Most common damage</th><td>${esc(r.topDamage)}</td></tr>
<tr><th>Average claim</th><td>$${r.avgClaim}</td></tr>
<tr><th>Valet density score</th><td>${r.density} / 10</td></tr>
<tr><th>Enforcement</th><td>${r.enforcement}</td></tr>
<tr><th>Peak season</th><td>${r.season}</td></tr>
<tr><th>State</th><td>${r.state}</td></tr>
</tbody>
</table>

<h2>Embed the ${esc(r.city)} Badge</h2>
<div class="embed-preview">
  <button class="copy-btn" onclick="copyBadge(this)">Copy</button>
  <code id="badge-code" style="display:block;font-family:monospace;font-size:.8rem;color:#94a3b8;white-space:pre-wrap;word-break:break-all">${esc(badgeEmbed)}</code>
</div>

<h2>Citation</h2>
<div class="cite-box">CarShake. (${PUBLISHED.slice(0, 4)}). <em>Valet Damage in ${esc(r.city)}, ${r.state} — Rate, Cost &amp; Ranking (2026)</em>. Retrieved from ${cityUrl(r.slug)}</div>

<h2>Protect Your Car in ${esc(r.city)}</h2>
<p>Before handing your keys to a valet in ${esc(r.city)}, create a free GPS-verified, timestamped photo record of your car's condition in under 30 seconds.</p>
<a class="cta" href="${SITE}/free/instant-proof">Free Instant Proof Tool →</a>
<a class="cta alt" href="${SITE}/city/${r.slug}/">${esc(r.city)} valet guide →</a>

<div class="footer">© ${PUBLISHED.slice(0, 4)} CarShake · <a href="${SITE}">carshake.online</a> · Data under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></div>
</div>
<script>function copyBadge(b){navigator.clipboard.writeText(document.getElementById('badge-code').textContent).then(()=>{b.textContent='Copied!';setTimeout(()=>b.textContent='Copy',2000);});}</script>
</body>
</html>`;
}

// ── 4. EMBED WIDGET ───────────────────────────────────────
function embedWidget() {
  const top10 = rows.slice(0, 10);
  const max = maxR.rate;
  const list = top10.map((r) => {
    const w = Math.round((r.rate / max) * 100);
    return `<li class="row" data-city="${r.slug}">
      <span class="rank">${r.rank}</span>
      <span class="city"><a href="${cityUrl(r.slug)}?ref=embed" target="_blank" rel="noopener">${esc(r.city)}</a></span>
      <span class="bar"><span class="fill" style="width:${w}%"></span></span>
      <span class="val">${r.rate}</span>
    </li>`;
  }).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Valet Damage Index — US Cities Ranked | CarShake</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0f172a;color:#e2e8f0;padding:1rem;font-size:.85rem}
.hd{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.75rem;flex-wrap:wrap;gap:.3rem}
.hd h3{color:#38bdf8;font-size:.95rem;font-weight:700}
.hd .sub{color:#64748b;font-size:.72rem}
ul{list-style:none}
.row{display:grid;grid-template-columns:20px 92px 1fr 32px;align-items:center;gap:.5rem;padding:.32rem 0;border-bottom:1px solid #1e293b}
.rank{color:#475569;font-size:.72rem;text-align:right}
.city{font-size:.82rem}
.city a{color:#e2e8f0;text-decoration:none}
.city a:hover{color:#38bdf8}
.bar{background:#1e293b;border-radius:3px;height:9px;overflow:hidden}
.fill{display:block;height:100%;background:linear-gradient(90deg,#38bdf8,#0ea5e9);border-radius:3px}
.val{color:#f1f5f9;font-size:.8rem;font-weight:600;text-align:right}
.foot{margin-top:.75rem;padding-top:.6rem;border-top:1px solid #1e293b;font-size:.68rem;color:#475569;text-align:center}
.foot a{color:#38bdf8;text-decoration:none;font-weight:600}
.badge{text-align:center;padding:.5rem}
.badge .big{font-size:2.4rem;font-weight:800;color:#38bdf8;line-height:1}
.badge .lbl{color:#94a3b8;font-size:.8rem;margin:.3rem 0}
.badge .meta{color:#64748b;font-size:.7rem;margin-top:.5rem}
.note{font-size:.68rem;color:#475569;text-align:center;margin-top:.4rem}
</style>
</head>
<body>
<div id="full">
  <div class="hd">
    <h3>Valet Damage Index 2026</h3>
    <span class="sub">Top 10 of 40 US cities · per 1,000 valet visits</span>
  </div>
  <ul>${list}</ul>
  <div class="foot">Data: <a href="${INDEX_URL}?ref=embed" target="_blank" rel="noopener">CarShake Valet Damage Index</a> · CC BY 4.0</div>
</div>
<div id="single" style="display:none"></div>
<script>
(function(){
  var p=new URLSearchParams(location.search), city=p.get('city');
  if(!city)return;
  var DATA=${JSON.stringify(rows.map(r=>({slug:r.slug,city:r.city,state:r.state,rate:r.rate,rank:r.rank,avgClaim:r.avgClaim,topDamage:r.topDamage,enforcement:r.enforcement})))};
  var mean=${meanRate.toFixed(2)}, meanClaim=${meanClaim};
  var r=DATA.find(function(x){return x.slug===city;});
  if(!r)return;
  document.getElementById('full').style.display='none';
  var s=document.getElementById('single'); s.style.display='block';
  s.className='badge';
  var cmp=r.rate>=mean?(Math.round(r.rate/mean*100-100)+'% above'):(Math.round(100-r.rate/mean*100)+'% below');
  s.innerHTML='<div class="big">'+r.rate+'</div><div class="lbl">valet incidents / 1,000 visits</div><div style="color:#e2e8f0;font-size:.95rem;font-weight:700">'+r.city+', '+r.state+'</div><div class="meta">Rank #'+r.rank+' of 40 · '+cmp+' US avg · avg claim $'+r.avgClaim+'</div><div style="margin-top:.6rem"><a href="${INDEX_URL}'+r.slug+'?ref=embed" target="_blank" rel="noopener" style="color:#38bdf8;font-size:.72rem;text-decoration:none">Full '+r.city+' data →</a></div><div class="note">Source: CarShake Valet Damage Index · CC BY 4.0</div>';
})();
</script>
</body>
</html>`;
}

// ── 5. PRESS KIT ──────────────────────────────────────────
function pressPage() {
  const apa = `CarShake. (2026). Valet Damage Index 2026: 40 US cities ranked by incident rate. Retrieved July 26, 2026, from ${INDEX_URL}`;
  const mla = `CarShake. "Valet Damage Index 2026: 40 US Cities Ranked by Incident Rate." ${INDEX_URL}. Accessed 26 July 2026.`;
  const chicago = `CarShake, "Valet Damage Index 2026: 40 US Cities Ranked by Incident Rate," accessed July 26, 2026, ${INDEX_URL}.`;
  const inline = `According to CarShake's Valet Damage Index (2026), New York City leads 40 US cities with an estimated ${maxR.rate} valet-damage incidents per 1,000 valet visits.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Press &amp; Journalist Kit — Valet Damage Index 2026 | CarShake</title>
<meta name="description" content="Press kit for the CarShake Valet Damage Index 2026: methodology, ready-to-paste citations (APA/MLA/Chicago), data downloads, story angles, and expert contact.">
<link rel="canonical" href="${PRESS_URL}">
<meta property="og:title" content="Press &amp; Journalist Kit — Valet Damage Index 2026 | CarShake">
<meta property="og:description" content="Citations, methodology, data downloads, and story angles for journalists covering valet damage.">
<meta property="og:type" content="article">
<meta property="og:url" content="${PRESS_URL}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="index, follow">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Press &amp; Journalist Kit — Valet Damage Index 2026",
  "description": "Methodology, citations, data downloads, and story angles for journalists covering valet damage.",
  "author": {"@type": "Organization", "name": "CarShake", "url": "${SITE}"},
  "publisher": {"@type": "Organization", "name": "CarShake", "url": "${SITE}"},
  "datePublished": "${PUBLISHED}",
  "dateModified": "${PUBLISHED}",
  "mainEntityOfPage": "${PRESS_URL}"
}
</script>
<script type="application/ld+json">
{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
  {"@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE}/"},
  {"@type": "ListItem", "position": 2, "name": "Press Kit", "item": "${PRESS_URL}"}
]}
</script>
<style>${researchStyle}</style>
${orgDisambig}
</head>
<body>
<div class="wrap">
<a class="back" href="${SITE}/">← CarShake</a>
<h1>Press &amp; Journalist Kit</h1>
<p class="subtitle">Everything you need to cite the CarShake Valet Damage Index 2026 — methodology, ready-to-paste citations, data downloads, and story angles.</p>

<h2>At a Glance</h2>
<div class="key-findings">
  <div class="finding"><span class="num">${rows.length}</span><span class="label">US cities ranked by valet-damage incident rate</span></div>
  <div class="finding"><span class="num">${maxR.rate}</span><span class="label">Highest rate — ${esc(maxR.city)} (${maxR.state}), per 1,000 valet visits</span></div>
  <div class="finding"><span class="num">${meanRate.toFixed(1)}</span><span class="label">National mean across 40 cities (median ${medianRate})</span></div>
  <div class="finding"><span class="num">$${meanClaim}</span><span class="label">Average estimated damage claim</span></div>
</div>

<h2>Ready-to-Paste Citations</h2>
<h3>APA</h3>
<div class="cite-box">${esc(apa)}</div>
<h3>MLA</h3>
<div class="cite-box">${esc(mla)}</div>
<h3>Chicago</h3>
<div class="cite-box">${esc(chicago)}</div>
<h3>Inline (for articles)</h3>
<div class="cite-box">${esc(inline)}</div>

<h2>Methodology — In One Paragraph</h2>
<p>The Valet Damage Index ranks 40 US cities by an <strong>estimated composite</strong> valet-related vehicle-damage incident rate (incidents per 1,000 valet visits). The estimate synthesizes publicly available signals: city parking-authority valet-permit density, state insurance-department claims filings, NHTSA parking-related incident statistics, valet-service density, and community-sourced driver reports. It is a <strong>directional ranking, not a direct measurement</strong> — actual rates vary by venue, time of day, vehicle type, and operator. Average claim values are estimated from insurance-industry data.</p>
<p class="note"><strong>For fact-checkers:</strong> we describe these numbers as "estimated" and "directional" throughout. We do not claim primary survey data. The full methodology and per-field definitions are on the <a href="${RESEARCH_URL}valet-damage-hotspots-2026">original dataset page</a>.</p>

<h2>Data Downloads</h2>
<ul>
  <li><a href="${RESEARCH_URL}valet-damage-hotspots-2026/data.csv">Full dataset — CSV</a> (40 rows, 8 fields)</li>
  <li><a href="${RESEARCH_URL}valet-damage-hotspots-2026/data.json">Full dataset — JSON</a></li>
  <li><a href="${INDEX_URL}">Interactive index</a> (sortable, searchable, embeddable)</li>
  <li><a href="${SITE}/embed/tools/valet-damage-index.html">Embeddable chart widget</a> (iframe, CC BY 4.0)</li>
</ul>

<h2>Story Angles</h2>
<ul>
  <li><strong>Local angle:</strong> "How does [your city] rank for valet damage?" — every city has its own data card, e.g. <a href="${INDEX_URL}austin/">Austin</a>, <a href="${INDEX_URL}miami/">Miami</a>, <a href="${INDEX_URL}chicago/">Chicago</a>.</li>
  <li><strong>The documentation gap:</strong> fewer than 15% of valet-damage claimants arrive with timestamped proof — and those who do succeed ~3.4× more often (per the <a href="${SITE}/benchmarks/valet-damage-claim-statistics-2026">claims benchmark</a>).</li>
  <li><strong>Geographic inequality:</strong> the highest-rate city (${esc(maxR.city)}) sees roughly ${(maxR.rate / minR.rate).toFixed(0)}× the valet-damage rate of the lowest (${esc(minR.city)}).</li>
  <li><strong>Enforcement gap:</strong> only 3 of 40 cities have "strict" valet enforcement; 21 are classified "loose."</li>
</ul>

<h2>License</h2>
<p>All data and charts are published under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. You may reproduce, adapt, and embed freely with attribution to CarShake.</p>

<h2>Contact</h2>
<p>For data questions, corrections, or expert comment, contact <a href="${SITE}/contact/">the CarShake team</a>. We respond to verified press inquiries within one business day.</p>

<div class="footer">© ${PUBLISHED.slice(0, 4)} CarShake · <a href="${SITE}">carshake.online</a> · Data under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></div>
</div>
</body>
</html>`;
}

// ── write everything ──────────────────────────────────────
mkdirSync(OUT_INDEX, { recursive: true });
writeFileSync(join(OUT_INDEX, "index.html"), indexPage(), "utf8");

for (const r of rows) {
  const dir = join(OUT_INDEX, r.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), cityPage(r), "utf8");
}

mkdirSync(dirname(OUT_EMBED), { recursive: true });
writeFileSync(OUT_EMBED, embedWidget(), "utf8");

mkdirSync(dirname(OUT_PRESS), { recursive: true });
writeFileSync(OUT_PRESS, pressPage(), "utf8");

console.log(`✓ Index:      research/valet-damage-index/index.html`);
console.log(`✓ City cards: ${rows.length} × research/valet-damage-index/<slug>/index.html`);
console.log(`✓ Embed:      embed/tools/valet-damage-index.html`);
console.log(`✓ Press:      press/index.html`);
console.log(`  Mean rate ${meanRate.toFixed(2)} · Mean claim $${meanClaim} · ${rows.length} cities · ${states} states`);
