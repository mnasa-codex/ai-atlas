const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const postcss = require('postcss');

test('public visual rules never escape the public shell', () => {
  let count = 0;
  postcss.parse(fs.readFileSync('app/atlas.css', 'utf8')).walkRules(rule => {
    if (rule.parent.type === 'atrule' && rule.parent.name.endsWith('keyframes')) return;
    for (const selector of rule.selectors) assert.ok(selector.includes('.atlas-public'), selector);
    count++;
  });
  assert.ok(count > 100);
});

test('all application TypeScript and JSX sources parse', () => {
  const visit = dir => {
    for (const name of fs.readdirSync(dir)) {
      const file = path.join(dir, name);
      if (fs.statSync(file).isDirectory()) { visit(file); continue; }
      if (!/\.tsx?$/.test(file) || file.endsWith('.d.ts')) continue;
      const result = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        fileName: file, reportDiagnostics: true,
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      });
      const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
      assert.deepEqual(errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, ' ')), [], file);
    }
  };
  ['app', 'components', 'lib'].forEach(visit);
});

test('heavy scenes retain lazy-loading and paused rendering contracts', () => {
  const globe = fs.readFileSync('components/GlobeShowcase.tsx', 'utf8');
  const renderer = fs.readFileSync('components/Globe3D.tsx', 'utf8');
  const sky = fs.readFileSync('components/SiteAtmosphere.tsx', 'utf8');
  assert.match(globe, /dynamic\(\(\) => import\('\.\/Globe3D'\)/);
  assert.match(sky, /dynamic\(\(\) => import\('\.\/StarfieldBackground'\)/);
  assert.match(globe, /ssr: false/);
  assert.match(renderer, /frameloop=\{active \? 'always' : 'never'\}/);
  assert.match(renderer, /webglcontextlost/);
});

test('theme defaults preserve the original editor palette', () => {
  const theme = fs.readFileSync('tailwind.config.ts', 'utf8');
  assert.ok(theme.includes('--atlas-gold-rgb, 167 243 208'));
  assert.ok(theme.includes('--atlas-purple-rgb, 169 154 255'));
  assert.ok(theme.includes('--atlas-muted-rgb, 165 173 194'));
  const shell = fs.readFileSync('components/SiteShell.tsx', 'utf8');
  assert.ok(shell.includes("path === '/admin' || path.startsWith('/admin/')"));
  assert.ok(shell.includes('return <Structure>{children}</Structure>'));
});

test('motion preference changes and reduced-motion styles are supported', () => {
  const experience = fs.readFileSync('components/Experience.tsx', 'utf8');
  const styles = fs.readFileSync('app/atlas.css', 'utf8');
  assert.ok(experience.includes("preference.addEventListener('change', updateMotion)"));
  assert.ok(experience.includes("document.addEventListener('visibilitychange', updateVisibility)"));
  assert.ok(styles.includes('@media (prefers-reduced-motion: reduce)'));
  assert.ok(styles.includes('[data-motion="off"]'));
});
