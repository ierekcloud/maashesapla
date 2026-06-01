import fs from 'fs';
const html = fs.readFileSync('dist/index.html', 'utf8');
const scriptIndex = html.indexOf('<script');
const rootIndex = html.indexOf('id="root"');
console.log('Script index:', scriptIndex);
console.log('Root index:', rootIndex);
