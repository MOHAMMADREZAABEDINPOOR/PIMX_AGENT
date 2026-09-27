const fs = require('fs');
const path = require('path');

const publicFonts = path.join(__dirname, '..', 'public', 'fonts');
const persianDir = path.join(publicFonts, 'persian');
const displayDir = path.join(publicFonts, 'display');

fs.mkdirSync(persianDir, { recursive: true });
fs.mkdirSync(displayDir, { recursive: true });

const localFontsMeta = [];
const cssRules = [];

function cleanName(raw) {
  return raw
    .replace(/_P30Day\.com/gi, '')
    .replace(/\[DEMO\]/gi, '')
    .replace(/DEMO/gi, '')
    .replace(/Personal Use Only/gi, '')
    .replace(/\.ttf$|\.otf$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanFilename(raw) {
  return raw
    .replace(/_P30Day\.com/gi, '')
    .replace(/\[DEMO\]/gi, '')
    .replace(/DEMO/gi, '')
    .replace(/Personal Use Only/gi, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.\-_]/g, '')
    .trim();
}

// 1. Organize B series Persian fonts
const bFontsDir = path.join(__dirname, '..', 'font', 'B.Borna.Rayaneh.ttf-png_P30Day.com', 'Fonts');
if (fs.existsSync(bFontsDir)) {
  const files = fs.readdirSync(bFontsDir);
  for (const f of files) {
    if (/\.ttf$/i.test(f)) {
      const name = cleanName(f);
      const safeName = cleanFilename(f);
      const dest = path.join(persianDir, safeName);
      fs.copyFileSync(path.join(bFontsDir, f), dest);

      const id = 'local-' + safeName.replace(/\.ttf$/i, '').toLowerCase();
      localFontsMeta.push({
        id,
        name,
        fontFamily: name,
        category: 'PERSIAN',
        language: 'Persian',
        script: 'Persian / Arabic',
        format: 'ttf',
        url: '/fonts/persian/' + safeName,
        isLocal: true,
      });

      cssRules.push(`@font-face {
  font-family: '${name}';
  src: url('/fonts/persian/${safeName}') format('truetype');
  font-display: swap;
}`);
    }
  }
}

// 2. Organize SCICT Standardized Persian fonts
const scictDir = path.join(__dirname, '..', 'font', '39.Standardized.Persian.Fonts.By.SCICT.ttf-png_P30Day.com', 'Fonts');
if (fs.existsSync(scictDir)) {
  const files = fs.readdirSync(scictDir);
  for (const f of files) {
    if (/\.ttf$/i.test(f)) {
      const name = cleanName(f);
      const safeName = 'SCICT-' + cleanFilename(f);
      const dest = path.join(persianDir, safeName);
      fs.copyFileSync(path.join(scictDir, f), dest);

      const id = 'local-scict-' + safeName.replace(/\.ttf$/i, '').toLowerCase();
      localFontsMeta.push({
        id,
        name: 'SCICT ' + name,
        fontFamily: 'SCICT ' + name,
        category: 'PERSIAN',
        language: 'Persian',
        script: 'Persian / Arabic',
        format: 'ttf',
        url: '/fonts/persian/' + safeName,
        isLocal: true,
      });

      cssRules.push(`@font-face {
  font-family: 'SCICT ${name}';
  src: url('/fonts/persian/${safeName}') format('truetype');
  font-display: swap;
}`);
    }
  }
}

// 3. Organize Sharif FarsiWeb fonts
const sharifDir = path.join(__dirname, '..', 'font', 'Sharif.FarsiWeb.Fonts.v0.4.ttf-png_P30Day.com', 'Fonts');
if (fs.existsSync(sharifDir)) {
  const files = fs.readdirSync(sharifDir);
  for (const f of files) {
    if (/\.ttf$/i.test(f)) {
      const name = cleanName(f);
      const safeName = 'FarsiWeb-' + cleanFilename(f);
      const dest = path.join(persianDir, safeName);
      fs.copyFileSync(path.join(sharifDir, f), dest);

      const id = 'local-farsiweb-' + safeName.replace(/\.ttf$/i, '').toLowerCase();
      localFontsMeta.push({
        id,
        name: 'FarsiWeb ' + name,
        fontFamily: 'FarsiWeb ' + name,
        category: 'PERSIAN',
        language: 'Persian',
        script: 'Persian / Arabic',
        format: 'ttf',
        url: '/fonts/persian/' + safeName,
        isLocal: true,
      });

      cssRules.push(`@font-face {
  font-family: 'FarsiWeb ${name}';
  src: url('/fonts/persian/${safeName}') format('truetype');
  font-display: swap;
}`);
    }
  }
}

// 4. Organize root display and creative fonts
const rootFontFiles = fs.readdirSync(path.join(__dirname, '..', 'font'));
for (const f of rootFontFiles) {
  const full = path.join(__dirname, '..', 'font', f);
  if (fs.statSync(full).isFile() && /\.(ttf|otf)$/i.test(f)) {
    const ext = path.extname(f).toLowerCase().slice(1);
    const format = ext === 'otf' ? 'opentype' : 'truetype';
    const name = cleanName(f);
    const safeName = cleanFilename(f);
    const dest = path.join(displayDir, safeName);
    fs.copyFileSync(full, dest);

    const id = 'local-disp-' + safeName.replace(/\.(ttf|otf)$/i, '').toLowerCase();
    localFontsMeta.push({
      id,
      name,
      fontFamily: name,
      category: 'DISPLAY',
      language: 'English',
      script: 'Latin',
      format: ext,
      url: '/fonts/display/' + safeName,
      isLocal: true,
    });

    cssRules.push(`@font-face {
  font-family: '${name}';
  src: url('/fonts/display/${safeName}') format('${format}');
  font-display: swap;
}`);
  }
}

// 5. Write local-fonts.css and local-fonts-meta.json
fs.writeFileSync(path.join(publicFonts, 'local-fonts.css'), cssRules.join('\n\n'));
fs.writeFileSync(path.join(publicFonts, 'local-fonts-meta.json'), JSON.stringify(localFontsMeta, null, 2));

console.log('Successfully organized', localFontsMeta.length, 'local fonts into public/fonts/');
console.log('- Persian local fonts:', localFontsMeta.filter(f => f.category === 'PERSIAN').length);
console.log('- Display / Latin local fonts:', localFontsMeta.filter(f => f.category === 'DISPLAY').length);
console.log('Generated public/fonts/local-fonts.css with', cssRules.length, '@font-face rules');
