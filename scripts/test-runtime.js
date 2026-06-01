import fs from 'fs';
import { JSDOM } from 'jsdom';

console.log('--- Testing runtime initialization of Maas_Hesapla.html in simulated browser ---');

const html = fs.readFileSync('Maas_Hesapla.html', 'utf8');

// Set up JSDOM
const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "file:///app/applet/Maas_Hesapla.html"
});

// Capture console logs and errors
dom.window.console.error = (...args) => {
  console.log('BROWSER ERROR:', ...args);
};
dom.window.console.log = (...args) => {
  console.log('BROWSER LOG:', ...args);
};

// Wait for a second to see if react mounts
setTimeout(() => {
  const rootElement = dom.window.document.getElementById('root');
  console.log('Root element HTML:', rootElement ? rootElement.innerHTML : 'Not found');
  process.exit(0);
}, 1000);
