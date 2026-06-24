/**
 * Copy the freshly-generated Playwright HTML report to report/index.html,
 * injecting a high-contrast light-theme override so the single-file report is
 * readable when opened directly (file://) regardless of the viewer's OS theme.
 *
 * Run after `playwright test` (the report lands in playwright-report/index.html).
 * Used both locally (`npm run publish:report`) and in CI to keep report/ current.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const SRC = 'playwright-report/index.html';
const OUT_DIR = 'report';
const OUT = `${OUT_DIR}/index.html`;

const OVERRIDE = `<style id="contracts-readability-override">
:root,.light-mode,.dark-mode{
  color-scheme:light !important;
  --color-canvas-default:#ffffff !important;
  --color-canvas-subtle:#f6f8fa !important;
  --color-canvas-inset:#f6f8fa !important;
  --color-fg-default:#1a1a1a !important;
  --color-fg-muted:#1f2328 !important;
  --color-fg-subtle:#3a3f45 !important;
  --color-border-default:#d0d7de !important;
  --color-border-muted:#d8dee4 !important;
  --color-neutral-muted:#afb8c133 !important;
}
html,body{background:#ffffff !important;color:#1a1a1a !important;}
a,.test-file-title,.chip-header,.tree-item-title,.test-file-test{color:#1a1a1a !important;}
</style>`;

if (!existsSync(SRC)) {
  console.error(`No report found at ${SRC}; nothing to publish.`);
  process.exit(0);
}

let html = readFileSync(SRC, 'utf8');
if (!html.includes('contracts-readability-override')) {
  html = html.replace('</head>', `${OVERRIDE}\n</head>`);
}
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, html);
console.log(`Published readable report -> ${OUT} (${html.length} bytes)`);
