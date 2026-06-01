import fs from 'fs';
import { JSDOM } from 'jsdom';

console.log('--- Testing root Maas_Hesapla.html runtime ---');

const html = fs.readFileSync('Maas_Hesapla.html', 'utf8');

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "file:///C:/Users/Name/Desktop/Maas_Hesapla.html"
});

let runtimeFailed = false;
// JSDOM captures console output
dom.window.console.error = (...args) => {
  console.error('TEST RUNTIME EXCEPTION:', ...args);
  runtimeFailed = true;
};
dom.window.console.warn = () => {}; 
dom.window.console.log = (...args) => {
  // console.log('TEST BROWSER LOG:', ...args);
};

setTimeout(() => {
  const rootElement = dom.window.document.getElementById('root');
  const errorPanel = dom.window.document.getElementById('diagnostics-panel');
  
  console.log('Root element HTML content length:', rootElement ? rootElement.innerHTML.length : 0);
  console.log('Error panel display:', errorPanel ? errorPanel.style.display : 'N/A');
  if (errorPanel && errorPanel.style.display === 'block') {
      console.log('DIAGNOSTICS TRIGGERED!');
      const logger = dom.window.document.getElementById('diagnostics-error-log');
      console.log('ERROR LOG:\n', logger ? logger.textContent : 'Unknown');
  }

  process.exit(0);
}, 1500);
