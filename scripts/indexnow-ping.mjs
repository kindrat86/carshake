#!/usr/bin/env node
/**
 * IndexNow ping — submits every URL in the page sitemaps to IndexNow
 * (Bing, Yandex, Seznam, Naver). Runs automatically as the last step of
 * `npm run deploy`.
 *
 * Replaces scripts/indexnow-ping.sh, which hard-coded 24 URLs. This version
 * derives the URL list from sitemap.xml so every deployed page is announced.
 * The IndexNow key and key file are unchanged:
 *   key          = 3d7a0a3ab52446538a57a3c55a5a9023
 *   keyLocation  = https://carshake.online/3d7a0a3ab52446538a57a3c55a5a9023.txt
 *                  (the file 3d7a0a3ab52446538a57a3c55a5a9023.txt ships from
 *                  repo root; it is not in .vercelignore, so it is reachable)
 *
 * IndexNow's API documents a 10,000-URL-per-request limit, but in practice
 * Bing rejects batches above ~50 URLs with HTTP 403. We chunk at 40 to stay
 * safely under the observed threshold, with a 2s delay between batches to
 * avoid the rate-limit throttle. image-sitemap.xml is intentionally excluded
 * — its <loc> entries are image URLs, not pages.
 *
 * Exit code is always 0: search-engine pinging is best-effort and must not
 * block a deploy on a transient IndexNow outage.
 *
 * Usage: node scripts/indexnow-ping.mjs [sitemap1.xml sitemap2.xml ...]
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const HOST = 'carshake.online';
const KEY = '3d7a0a3ab52446538a57a3c55a5a9023';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH_SIZE = 40;
const DEFAULT_SITEMAPS = ['sitemap.xml'];
const SITEMAPS = (process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_SITEMAPS)
  .map(f => resolve(f));

function extractUrls(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) urls.push(m[1].trim());
  return urls;
}

async function submitBatch(urls) {
  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  });
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: payload,
  });
  // 200 = processed, 202 = accepted for processing. Both are success.
  return { status: res.status, ok: res.status === 200 || res.status === 202 };
}

async function main() {
  const urls = [];
  for (const sitemap of SITEMAPS) {
    let xml;
    try {
      xml = readFileSync(sitemap, 'utf8');
    } catch (e) {
      console.error(`[indexnow] could not read ${sitemap}: ${e.message} — skipping this file.`);
      continue;
    }
    const found = extractUrls(xml);
    urls.push(...found);
    console.error(`[indexnow] ${sitemap}: ${found.length} URL(s)`);
  }

  if (urls.length === 0) {
    console.error('[indexnow] no <loc> URLs found in any sitemap — skipping ping.');
    process.exit(0);
  }

  // De-duplicate across sitemaps after merging, so per-file counts above stay honest.
  const deduped = [...new Set(urls)];
  if (deduped.length !== urls.length) {
    console.error(`[indexnow] de-duplicated ${urls.length} → ${deduped.length} URLs`);
  }

  console.log(`[indexnow] submitting ${deduped.length} URL(s) in batches of ${BATCH_SIZE}…`);

  let okBatches = 0;
  let failBatches = 0;
  const batches = [];
  for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
    batches.push(deduped.slice(i, i + BATCH_SIZE));
  }
  for (let n = 0; n < batches.length; n++) {
    const batch = batches[n];
    // Pace requests: Bing/IndexNow rate-limits (HTTP 403) when too many
    // submissions arrive in quick succession. A short delay between batches
    // keeps us under the throttle.
    if (n > 0) await new Promise(r => setTimeout(r, 2000));
    try {
      const { status, ok } = await submitBatch(batch);
      if (ok) {
        okBatches++;
        console.log(`[indexnow] batch ${n + 1}: ${batch.length} URLs → HTTP ${status} (accepted)`);
      } else {
        failBatches++;
        console.error(`[indexnow] batch ${n + 1}: ${batch.length} URLs → HTTP ${status} (rejected)`);
      }
    } catch (e) {
      failBatches++;
      console.error(`[indexnow] batch ${n + 1}: network error — ${e.message}`);
    }
  }

  console.log(`[indexnow] done: ${okBatches} batch(es) accepted, ${failBatches} failed.`);
  process.exit(0);
}

main();
