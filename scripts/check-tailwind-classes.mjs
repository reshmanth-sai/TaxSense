#!/usr/bin/env node
/**
 * Fails when a Tailwind colour utility in src/ produces no CSS.
 *
 * The project defines off-scale shades (slate-450, emerald-655, ...) in the
 * `@theme` block of src/index.css. Nothing stops a component reaching for a
 * shade that was never defined -- Tailwind emits no rule for it and the element
 * silently inherits its parent's colour instead. `text-slate-655` sat on every
 * landing-section sub-headline for months for exactly this reason: the
 * `dark:` half was defined and the light half was not, so the bug was invisible
 * to anyone reviewing in dark mode.
 *
 * Run after `vite build`, against the emitted stylesheet.
 *
 *   node scripts/check-tailwind-classes.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const SRC = 'src';
const DIST_ASSETS = 'dist/assets';

const PREFIX =
  '(?:text|bg|border|ring|from|via|to|shadow|decoration|divide|outline|accent|fill|stroke|placeholder|caret)';
const PALETTE =
  '(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)';
const CLASS_RE = new RegExp(`\\b${PREFIX}-${PALETTE}-\\d{3}\\b`, 'g');

/** Shades Tailwind ships by default; anything else must be declared in @theme. */
const STOCK = new Set(['100', '200', '300', '400', '500', '600', '700', '800', '900', '950']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (['.ts', '.tsx'].includes(extname(p))) out.push(p);
  }
  return out;
}

function loadStylesheet() {
  let files;
  try {
    files = readdirSync(DIST_ASSETS).filter((f) => f.endsWith('.css'));
  } catch {
    console.error(`No ${DIST_ASSETS}. Run "npm run build" first.`);
    process.exit(2);
  }
  if (files.length === 0) {
    console.error(`No stylesheet in ${DIST_ASSETS}. Run "npm run build" first.`);
    process.exit(2);
  }
  return files.map((f) => readFileSync(join(DIST_ASSETS, f), 'utf8')).join('\n');
}

const css = loadStylesheet();
const dead = new Map();

for (const file of walk(SRC)) {
  const source = readFileSync(file, 'utf8');
  for (const cls of source.match(CLASS_RE) ?? []) {
    const shade = cls.slice(cls.lastIndexOf('-') + 1);
    if (STOCK.has(shade)) continue;
    if (css.includes(cls)) continue; // custom shade, but declared in @theme
    if (!dead.has(cls)) dead.set(cls, new Set());
    dead.get(cls).add(file);
  }
}

if (dead.size === 0) {
  console.log('Tailwind colour check: every colour utility in src/ emits CSS.');
  process.exit(0);
}

console.error(`\nTailwind colour check FAILED - ${dead.size} class(es) emit no CSS:\n`);
for (const [cls, files] of [...dead].sort()) {
  console.error(`  ${cls}`);
  for (const f of [...files].sort()) console.error(`      ${f}`);
}
console.error(
  '\nEither use a stock shade (100-950) or declare the custom one in the @theme block of src/index.css.\n'
);
process.exit(1);
