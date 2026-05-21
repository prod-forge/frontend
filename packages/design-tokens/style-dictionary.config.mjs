import StyleDictionary from 'style-dictionary';
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';

const TMP = '.tmp';
const CSS_TRANSFORMS = ['attribute/cti', 'name/kebab'];

// ── Custom formats ────────────────────────────────────────

function registerCssFormat(name, filterFn, selector) {
  StyleDictionary.registerFormat({
    name,
    format: ({ dictionary }) => {
      const tokens = dictionary.allTokens.filter(filterFn);
      if (tokens.length === 0) return '';

      const vars = tokens
        .map((t) => {
          // Strip '-light' or '-dark' segment so paths like color.light.bg → --color-bg
          const varName = t.name.replace(/-(?:light|dark)(?=-|$)/, '');
          return `  --${varName}: ${t.$value ?? t.value};`;
        })
        .join('\n');

      return `${selector} {\n${vars}\n}\n`;
    },
  });
}

registerCssFormat(
  'css/base',
  (t) => !t.path.includes('light') && !t.path.includes('dark'),
  ':root',
);

registerCssFormat(
  'css/light',
  (t) => t.path.includes('light'),
  ':root',
);

registerCssFormat(
  'css/dark',
  (t) => t.path.includes('dark'),
  "[data-theme='dark']",
);

// JS format: nested camelCase exports with mobile-friendly values
StyleDictionary.registerFormat({
  name: 'js/nested',
  format: ({ dictionary }) => {
    const toCamel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

    const result = {};
    for (const t of dictionary.allTokens) {
      let obj = result;
      const path = t.path.map(toCamel);

      for (let i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]]) obj[path[i]] = {};
        obj = obj[path[i]];
      }

      let value = t.$value ?? t.value;
      // Dimensions → unitless numbers for mobile (e.g. "4px" → 4)
      if (t.$type === 'dimension' && typeof value === 'string') {
        value = parseFloat(value);
      }
      obj[path.at(-1)] = value;
    }

    const lines = ['// Auto-generated. Do not edit manually.'];
    for (const [key, val] of Object.entries(result)) {
      lines.push(`export const ${key} = ${JSON.stringify(val, null, 2)};`);
    }
    return lines.join('\n') + '\n';
  },
});

// ── Build ─────────────────────────────────────────────────

mkdirSync(TMP, { recursive: true });
mkdirSync('js', { recursive: true });

const sd = new StyleDictionary({
  source: [
    'src/tokens/base/**/*.json',
    'src/tokens/color/light.json',
    'src/tokens/color/dark.json',
    'src/tokens/shadow/light.json',
    'src/tokens/shadow/dark.json',
  ],
  platforms: {
    'css-base': {
      transforms: CSS_TRANSFORMS,
      buildPath: `${TMP}/`,
      files: [{ destination: 'base.css', format: 'css/base' }],
    },
    'css-light': {
      transforms: CSS_TRANSFORMS,
      buildPath: `${TMP}/`,
      files: [{ destination: 'light.css', format: 'css/light' }],
    },
    'css-dark': {
      transforms: CSS_TRANSFORMS,
      buildPath: `${TMP}/`,
      files: [{ destination: 'dark.css', format: 'css/dark' }],
    },
    js: {
      transforms: ['attribute/cti', 'name/kebab'],
      buildPath: 'js/',
      files: [{ destination: 'index.mjs', format: 'js/nested' }],
    },
  },
});

await sd.buildAllPlatforms();

// ── Assemble tokens.css ───────────────────────────────────

function extractVars(css) {
  const start = css.indexOf('{');
  const end = css.lastIndexOf('}');
  return start === -1 ? '' : css.slice(start + 1, end);
}

const baseVars = extractVars(readFileSync(`${TMP}/base.css`, 'utf-8'));
const lightVars = extractVars(readFileSync(`${TMP}/light.css`, 'utf-8'));
const darkVars = extractVars(readFileSync(`${TMP}/dark.css`, 'utf-8'));

const darkIndented = darkVars
  .split('\n')
  .map((l) => (l.trim() ? `    ${l.trimStart()}` : l))
  .join('\n');

const tokens = [
  ':root {',
  baseVars.trimEnd(),
  lightVars.trimEnd(),
  '}',
  '',
  "[data-theme='dark'] {",
  darkVars.trimEnd(),
  '}',
  '',
  '@media (prefers-color-scheme: dark) {',
  "  :root:not([data-theme='light']) {",
  darkIndented.trimEnd(),
  '  }',
  '}',
  '',
].join('\n');

writeFileSync('tokens.css', tokens);

// ── Generate TypeScript declaration ───────────────────────

const jsSource = readFileSync('js/index.mjs', 'utf-8');

function inferTsType(val, depth = 0) {
  if (typeof val === 'number') return 'number';
  if (typeof val === 'string') return 'string';
  if (typeof val === 'object' && val !== null) {
    const indent = '  '.repeat(depth + 1);
    const entries = Object.entries(val)
      .map(([k, v]) => {
        const key = /^\d/.test(k) ? `'${k}'` : k;
        return `${indent}${key}: ${inferTsType(v, depth + 1)};`;
      })
      .join('\n');
    return `{\n${entries}\n${'  '.repeat(depth)}}`;
  }
  return 'unknown';
}

const exportRegex = /^export const (\w+) = ([\s\S]*?)(?=\nexport const |\n$)/gm;
const dtsLines = ['// Auto-generated. Do not edit manually.'];
let m;
while ((m = exportRegex.exec(jsSource + '\n')) !== null) {
  const [, name, rawValue] = m;
  try {
    // eslint-disable-next-line no-new-func
    const value = new Function(`return ${rawValue.trimEnd().replace(/;$/, '')}`)();
    dtsLines.push(`export declare const ${name}: ${inferTsType(value)};`);
  } catch {
    dtsLines.push(`export declare const ${name}: unknown;`);
  }
}
dtsLines.push('');

writeFileSync('js/index.d.ts', dtsLines.join('\n'));

// ── Cleanup ───────────────────────────────────────────────

rmSync(TMP, { recursive: true, force: true });
