import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const styles = new URL('../src/css/', import.meta.url);
const entries = (await readdir(styles)).filter(name => name.endsWith('.scss')).sort();

for (const entry of entries) {
  sass.compile(fileURLToPath(new URL(entry, styles)));
  console.log(`Compiled ${entry}`);
}

const abstracts = new URL('abstracts/', styles);
for (const partial of (await readdir(abstracts)).filter(name => name.endsWith('.scss'))) {
  const { css } = sass.compile(fileURLToPath(new URL(partial, abstracts)));
  if (css.trim()) {
    throw new Error(`abstracts/${partial} emits CSS; move its selectors to the owning layer.`);
  }
}

console.log(`Checked ${entries.length} page stylesheets; abstracts emit no CSS.`);
