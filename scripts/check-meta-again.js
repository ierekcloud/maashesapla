import fs from 'fs';
const html = fs.readFileSync('dist/index.html', 'utf8');
const meta = html.match(/import\.meta/g);
console.log('import.meta count in dist:', meta ? meta.length : 0);
const htmlRoot = fs.readFileSync('Maas_Hesapla.html', 'utf8');
const metaRoot = htmlRoot.match(/import\.meta/g);
console.log('import.meta count in root:', metaRoot ? metaRoot.length : 0);
