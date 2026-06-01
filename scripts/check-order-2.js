import fs from 'fs';
const html = fs.readFileSync('Maas_Hesapla.html', 'utf8');

// Find the index of the first <script defer="defer"> and id="root"
console.log('Script index:', html.indexOf('<script defer="defer">'));
console.log('Root index:', html.indexOf('id="root"'));
console.log('Size of html:', html.length);
