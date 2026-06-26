const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname, 'themes');
const themes = ['neo-dashboard', 'neo-default', 'neo-eclipse', 'neo-glass', 'neo-minimal', 'neo-vibrant'];

themes.forEach(theme => {
    const indexPath = path.join(themesDir, theme, 'index.html');
    if (!fs.existsSync(indexPath)) return;
    
    let html = fs.readFileSync(indexPath, 'utf8');

    // 1. Fix Emails (convert {{ .emails }} to comma separated string)
    html = html.replace(/\{\{\s*\.emails\s*\}\}/g, '{{ range $i, $e := .emails }}{{ if $i }}, {{ end }}{{ $e }}{{ end }}');

    // 2. Fix Configs (Change {{ range .proxies }} to JS parsing logic)
    // First, let's inject a hidden container for links
    const hiddenLinksHTML = `
            <!-- Hidden raw links for JS to parse -->
            <div id="raw-links-container" style="display:none;">
                {{ range .links }}
                <div class="raw-link">{{ . }}</div>
                {{ end }}
            </div>
            <div id="configs-container" class="config-list-container" style="display:flex; flex-direction:column; gap:16px;"></div>
    `;

    // Remove the old proxies loop
    if (html.includes('{{ range .proxies }}')) {
        // We will regex replace the entire proxies loop block
        html = html.replace(/\{\{\s*range\s*\.proxies\s*\}\}[\s\S]*?\{\{\s*end\s*\}\}/g, hiddenLinksHTML);
    }

    // 3. Fix neo-vibrant modal styling
    if (theme === 'neo-vibrant') {
        html = html.replace(/class="btn-copy"/g, 'class="copy-btn" style="padding: 12px; border-radius: 12px; background: var(--bg-card); color: var(--text-primary); text-decoration: none; display: flex; justify-content: center; width: 100%; border: 1px solid var(--card-border);"');
        // specifically fix the first copy button background which was transparent
        html = html.replace(/'class="copy-btn" style="padding: 12px; border-radius: 12px; background: var\(--bg-card\)/, 'class="copy-btn" style="padding: 12px; border-radius: 12px; background: var(--primary)');
    }

    fs.writeFileSync(indexPath, html);

    // 4. Update JS to parse the links and render them!
    const appJsPath = path.join(themesDir, theme, 'assets', 'js', 'app.js');
    if (fs.existsSync(appJsPath)) {
        let appJs = fs.readFileSync(appJsPath, 'utf8');
        
        // Render configs logic
        const renderConfigsFunc = `
function renderConfigs() {
    const container = document.getElementById('configs-container');
    const rawLinksContainer = document.getElementById('raw-links-container');
    if (!container || !rawLinksContainer) return;

    const rawLinks = Array.from(rawLinksContainer.querySelectorAll('.raw-link')).map(el => el.innerText.trim()).filter(l => l.length > 0);
    
    if (rawLinks.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 24px; color: var(--text-sub, #999);">No configs available</div>';
        return;
    }

    container.innerHTML = '';
    rawLinks.forEach(link => {
        let name = "Unknown Config";
        let protocol = "vpn";
        try {
            // Extract hash
            const hashIndex = link.indexOf('#');
            if (hashIndex !== -1) {
                name = decodeURIComponent(link.substring(hashIndex + 1));
            }
            // Extract protocol
            const protoIndex = link.indexOf('://');
            if (protoIndex !== -1) {
                protocol = link.substring(0, protoIndex).toLowerCase();
            }
        } catch (e) {}
        
        // Basic card template that fits most themes
        const card = document.createElement('div');
        card.style.cssText = 'background: var(--bg-card, rgba(255,255,255,0.05)); border-radius: 16px; padding: 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--card-border, rgba(0,0,0,0.05)); margin-bottom: 12px;';
        
        card.innerHTML = \`
            <div style="display:flex; align-items:center; gap: 12px; overflow: hidden; flex: 1;">
                <div style="width: 40px; height: 40px; border-radius: 12px; background: var(--primary, #3b82f6); color: white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size: 0.75rem; text-transform: uppercase;">\${protocol.substring(0,4)}</div>
                <div style="flex:1; overflow:hidden;">
                    <h4 style="margin:0; font-size:1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color: var(--text-main, inherit);">\${name}</h4>
                    <p style="margin:2px 0 0; font-size:0.75rem; color: var(--text-sub, #999);">\${protocol}</p>
                </div>
            </div>
            <div style="display:flex; gap: 8px; margin-left: 12px;">
                <button onclick="copyToClipboard('\${link}', 'Config Copied!')" style="background:var(--bg-main, transparent); border:1px solid var(--card-border, rgba(0,0,0,0.1)); color:var(--text-main, inherit); padding:8px; border-radius:8px; cursor:pointer;">Copy</button>
                <button onclick="showQR('\${link}', '\${name}')" style="background:var(--text-main, #000); color:var(--bg-main, #fff); border:none; padding:8px; border-radius:8px; cursor:pointer;">QR</button>
            </div>
        \`;
        container.appendChild(card);
    });
}
`;
        if (!appJs.includes('function renderConfigs()')) {
            appJs = appJs + '\n' + renderConfigsFunc;
        }

        // Add renderConfigs to DOMContentLoaded
        if (appJs.includes('initDaysStats();')) {
            appJs = appJs.replace('initDaysStats();', 'initDaysStats(); renderConfigs();');
        } else if (appJs.includes('initDateTimeFormatting();')) {
            appJs = appJs.replace('initDateTimeFormatting();', 'initDateTimeFormatting(); renderConfigs();');
        } else if (appJs.includes('initThemeToggle();')) {
            appJs = appJs.replace('initThemeToggle();', 'initThemeToggle(); renderConfigs();');
        }

        fs.writeFileSync(appJsPath, appJs);
    }
    
    // 5. Fix Eclipse alignment
    if (theme === 'eclipse') {
        // Handled in main.css
    }
});

console.log('Themes updated successfully with fix_everything!');
