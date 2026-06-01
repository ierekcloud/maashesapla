import fs from 'fs';
const html = fs.readFileSync('Maas_Hesapla.html', 'utf8');

const imports = Array.from(html.matchAll(/\bimport\b[^"']/g)).map(m => html.substring(m.index - 20, m.index + 50));
console.log('imports:', imports.length, imports.join('\n\n'));

const exports = Array.from(html.matchAll(/\bexport\b[^"']/g)).map(m => html.substring(m.index - 20, m.index + 50));
console.log('exports:', exports.length, exports.join('\n\n'));
