import fs from 'fs';
const html = fs.readFileSync('Maas_Hesapla.html', 'utf8');

const styleIndex = html.indexOf('<style');
console.log('Style index:', styleIndex);
const htmlRegex = /<html[^>]*>([\s\S]*?)<\/html>/gi;
const allMatch = html.match(htmlRegex);
console.log('Valid html tag:', allMatch != null);
console.log('DocType exists:', html.includes('<!DOCTYPE html>'));
