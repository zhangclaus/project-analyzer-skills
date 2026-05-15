#!/usr/bin/env node
// Build a self-contained HTML template with inlined JS libraries.
// Usage: node scripts/build-template.mjs
// Output: templates/cytoscape-standalone.html

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const template = readFileSync(join(root, 'templates/cytoscape-template.html'), 'utf8');
const libsDir = join(root, 'templates/libs');

const cytoscape = readFileSync(join(libsDir, 'cytoscape.min.js'), 'utf8');
const dagre = readFileSync(join(libsDir, 'dagre.js'), 'utf8');
const cytoscapeDagre = readFileSync(join(libsDir, 'cytoscape-dagre.js'), 'utf8');

// Use split+join for exact string replacement (replace doesn't work when inlined content contains the target string)
let output = template;
output = output.split('<script src="../libs/cytoscape.min.js"></script>').join('<script>' + cytoscape + '</script>');
output = output.split('<script src="../libs/dagre.js"></script>').join('<script>' + dagre + '</script>');
output = output.split('<script src="../libs/cytoscape-dagre.js"></script>').join('<script>' + cytoscapeDagre + '</script>');

const outPath = join(root, 'templates/cytoscape-standalone.html');
writeFileSync(outPath, output);
console.log(`Built: ${outPath} (${(output.length / 1024).toFixed(0)}KB)`);
