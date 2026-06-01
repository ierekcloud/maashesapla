import fs from 'fs';
import path from 'path';

const distPath = path.join(process.cwd(), 'dist/index.html');
const outputPath = path.join(process.cwd(), 'public/dist-app.html');
const rootOutputPath = path.join(process.cwd(), 'Maas_Hesapla.html');

if (!fs.existsSync(distPath)) {
  console.error('dist/index.html does not exist! Please run npm run build first.');
  process.exit(1);
}

let html = fs.readFileSync(distPath, 'utf8');

// 1. Remove references to any external assets like manifest if they exist
html = html.replace(/<link\s+rel="manifest"\s+href="[^"]*"\s*\/?>/g, '');

// 2. Strip type="module" and crossorigin from any script tags. This is critical for offline file:// execution.
// crossorigin breaks on file://. type="module" breaks inline execution if strict checks are applied or breaks some imports.
html = html.replace(/<script[^>]*type="module"[^>]*>/gi, '<script>');
html = html.replace(/<script[^>]*crossorigin[^>]*>/gi, '<script>');

// Replace import.meta.url with standard location value to avoid SyntaxError in classic scripts
html = html.replace(/import\.meta\.url/g, "('file://' + (typeof location !== 'undefined' ? location.pathname : ''))");

// 3. Remove modulepreload links just in case Vite left any
html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>/gi, '');

// Diagnostic script to catch and visual-render syntax or execution errors in local double-click
const diagnosticScript = `
<script>
  (function() {
    var logs = [];
    function showDiagnostics(message) {
      window.MaasAppFailed = true;
      var panel = document.getElementById('diagnostics-panel');
      var logger = document.getElementById('diagnostics-error-log');
      if (panel && logger) {
        panel.style.display = 'block';
        if (logs.indexOf(message) === -1) {
          logs.push(message);
        }
        logger.textContent = logs.join('\\n\\n');
      } else {
        // Fallback if DOM is not ready
        document.addEventListener('DOMContentLoaded', function() {
          showDiagnostics(message);
        });
        document.write("<div style='background:red;color:white;padding:20px;font-family:sans-serif;'><h3>CRITICAL ERROR</h3><pre>" + message + "</pre></div>");
      }
    }

    window.addEventListener('error', function(e) {
      showDiagnostics('Hata (Error): ' + e.message + '\\nSatır (Line): ' + e.lineno + ':' + e.colno + '\\nYığın (Stack): ' + (e.error ? e.error.stack : 'N/A'));
    });

    window.addEventListener('unhandledrejection', function(e) {
      showDiagnostics('Promise Hatası (Promise Rejection):\\n' + (e.reason ? (e.reason.stack || e.reason) : 'Bilinmeyen Sebep'));
    });
  })();
</script>
`;

const diagnosticPanel = `
<div id="diagnostics-panel" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #ffffff; color: #1e293b; z-index: 999999; padding: 32px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; overflow-y: auto;">
  <div style="max-width: 650px; margin: 40px auto; background: #fef2f2; border: 1px solid #fee2e2; padding: 28px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #991b1b; margin-top: 0; font-size: 22px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
      ⚠️ Uygulama Başlatılamadı
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
      Uygulama yerel bilgisayarınızda veya tarayıcınızda başlatılırken bir çalışma zamanı hatası oluştu. Lütfen panik yapmayın! Aşağıdaki teknik bilgiyi (metni) seçip kopyalayarak bana gönderin.
    </p>
    
    <div style="margin-top: 16px;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Hata Kaydı:</span>
      <pre id="diagnostics-error-log" style="margin-top: 6px; background: #0f172a; color: #f8fafc; padding: 20px; border-radius: 12px; font-family: monospace; font-size: 13px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; max-height: 350px;"></pre>
    </div>
  </div>
</div>
`;

// Insert the Diagnostic Script before </head>
const headPos = html.lastIndexOf('</head>');
if (headPos !== -1) {
  html = html.substring(0, headPos) + `\n${diagnosticScript}\n` + html.substring(headPos);
} else {
  html = diagnosticScript + html;
}

// Insert the Diagnostic Panel before </body>
const bodyPos = html.lastIndexOf('</body>');
if (bodyPos !== -1) {
  html = html.substring(0, bodyPos) + `\n${diagnosticPanel}\n` + html.substring(bodyPos);
} else {
  html = html + `\n${diagnosticPanel}`;
}

// Write the compiled file to destinations
const BOM = '\uFEFF';
fs.writeFileSync(outputPath, BOM + html, 'utf8');
fs.writeFileSync(rootOutputPath, BOM + html, 'utf8');
console.log('Successfully prepared public/dist-app.html and root Maas_Hesapla.html!');
