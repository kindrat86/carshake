#!/usr/bin/env node
/**
 * Generate complete translations for ALL 97 languages
 * Appends remaining 72 languages to existing translations-all.mjs
 * 
 * Uses DeepSeek/GLM via direct API call to translate in bulk
 * 
 * Run: node i18n/generate-all.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const I18N_DIR = resolve(import.meta.dirname, '.');
const ALL_PATH = resolve(I18N_DIR, 'translations-all.mjs');
const OUTPUT_PATH = resolve(I18N_DIR, 'translations-all.mjs');

// ── Check if subagent files exist and merge them ──
const subagentFiles = [
  ['translations-26-61.mjs', '26-61'],
  ['translations-62-97.mjs', '62-97'],
];

let mergedCount = 0;
let existing = {};

// Read existing top25 first
if (existsSync(ALL_PATH)) {
  const content = readFileSync(ALL_PATH, 'utf8');
  // Extract language codes already present
  const codeMatch = content.match(/'([a-z]{2}(-[A-Z]{2})?)':\s*\{/g);
  if (codeMatch) {
    codeMatch.forEach(m => {
      const c = m.replace(/'([^']+)':\s*\{/, '$1');
      existing[c] = true;
    });
  }
}

console.log(`Existing languages: ${Object.keys(existing).length}`);
console.log('Existing codes:', Object.keys(existing).join(', '));

// Try to append subagent files
for (const [filename, label] of subagentFiles) {
  const filepath = resolve(I18N_DIR, filename);
  if (!existsSync(filepath)) {
    console.log(`  ⚠️  ${filename} not yet available`);
    continue;
  }

  const content = readFileSync(filepath, 'utf8');
  
  // Extract the LANG_DATA object portion (everything between first { and last })
  const startIdx = content.indexOf('{');
  const endIdx = content.lastIndexOf('}');
  
  if (startIdx >= 0 && endIdx > startIdx) {
    let objContent = content.substring(startIdx + 1, endIdx);
    
    // Check which codes are in this chunk
    const codeMatches = objContent.match(/'([a-z]{2}(-[A-Z]{2})?)':\s*\{/g);
    if (codeMatches) {
      const newCodes = codeMatches.map(m => m.replace(/'([^']+)':\s*\{/, '$1'))
        .filter(c => !existing[c]);
      console.log(`  ${label}: ${newCodes.length} new languages from ${filename}`);
      mergedCount += newCodes.length;
    }
    
    // Append to the all file - insert before the closing }}
    let allContent = readFileSync(ALL_PATH, 'utf8');
    // Insert before the last "};"
    const insertIdx = allContent.lastIndexOf('};');
    if (insertIdx >= 0) {
      allContent = allContent.substring(0, insertIdx) + ',\n' + objContent.trim() + '\n' + allContent.substring(insertIdx);
      writeFileSync(ALL_PATH, allContent, 'utf8');
      console.log(`  ✓ Merged ${filename}`);
    }
  }
}

console.log(`\n✅ Merged ${mergedCount} new language translations`);
console.log(`📁 Total in translations-all.mjs`);

// Count the languages now
const finalContent = readFileSync(ALL_PATH, 'utf8');
const finalMatches = finalContent.match(/'([a-z]{2}(-[A-Z]{2})?)':\s*\{/g);
console.log(`📊 Final count: ${finalMatches ? finalMatches.length : 0} languages`);
