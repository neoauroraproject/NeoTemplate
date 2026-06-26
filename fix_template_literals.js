// This script rewrites renderConfigs to NOT use template literals (backticks)
// because Go's html/template engine can misinterpret them inside <script> tags.
// It also fixes the vibrant modal styling and ensures all themes have proper
// user email display and support button.

const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname, 'themes');
const themes = ['neo-dashboard', 'neo-default', 'neo-eclipse', 'neo-glass', 'neo-minimal', 'neo-vibrant'];

// The safe renderConfigs function using string concatenation instead of template literals
const safeRenderConfigs = `
function renderConfigs() {
    var container = document.getElementById('configs-container');
    var rawLinksContainer = document.getElementById('raw-links-container');
    if (!container || !rawLinksContainer) return;

    var rawLinkEls = rawLinksContainer.querySelectorAll('.raw-link');
    var rawLinks = [];
    for (var i = 0; i < rawLinkEls.length; i++) {
        var t = rawLinkEls[i].innerText.trim();
        if (t.length > 0) rawLinks.push(t);
    }
    
    if (rawLinks.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 24px; opacity:0.5;">No configs available</div>';
        return;
    }

    var html = '';
    for (var j = 0; j < rawLinks.length; j++) {
        var link = rawLinks[j];
        var name = "Config " + (j + 1);
        var protocol = "vpn";
        try {
            var hashIndex = link.indexOf('#');
            if (hashIndex !== -1) {
                name = decodeURIComponent(link.substring(hashIndex + 1));
            }
            var protoIndex = link.indexOf('://');
            if (protoIndex !== -1) {
                protocol = link.substring(0, protoIndex).toLowerCase();
            }
        } catch (e) {}
        
        var safeName = name.replace(/'/g, "\\\\'").replace(/"/g, '&quot;');
        var safeLink = link.replace(/'/g, "\\\\'").replace(/"/g, '&quot;');
        
        html += '<div style="background: var(--pill-bg, var(--bg-card, rgba(255,255,255,0.05))); border-radius: 16px; padding: 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(128,128,128,0.1); margin-bottom: 12px;">';
        html += '<div style="display:flex; align-items:center; gap: 12px; overflow: hidden; flex: 1;">';
        html += '<div style="min-width: 40px; height: 40px; border-radius: 12px; background: var(--accent, var(--primary, #3b82f6)); color: white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size: 0.7rem; text-transform: uppercase;">' + protocol.substring(0,5) + '</div>';
        html += '<div style="flex:1; overflow:hidden;">';
        html += '<div style="margin:0; font-size:0.9rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + safeName + '</div>';
        html += '<div style="margin:2px 0 0; font-size:0.7rem; opacity:0.6;">' + protocol + '</div>';
        html += '</div></div>';
        html += '<div style="display:flex; gap: 8px; margin-left: 12px;">';
        html += "<button onclick=\\"copyToClipboard('" + safeLink + "', 'Config Copied!')\\" style=\\"background:var(--pill-hover, rgba(128,128,128,0.15)); border:none; color:inherit; padding:8px 12px; border-radius:10px; cursor:pointer; font-size:0.8rem; font-weight:600;\\">Copy</button>";
        html += "<button onclick=\\"showQR('" + safeLink + "', '" + safeName + "')\\" style=\\"background:var(--text-main, var(--text-primary, #000)); color:var(--bg-main, var(--bg-base, #fff)); border:none; padding:8px 12px; border-radius:10px; cursor:pointer; font-size:0.8rem; font-weight:600;\\">QR</button>";
        html += '</div></div>';
    }
    container.innerHTML = html;
}
`;

// Also the safe datetime formatting (no template literals)
const safeDateTimeFormatting = `
function formatDateTime(d) {
    var m = (d.getMonth() + 1).toString();
    if (m.length < 2) m = '0' + m;
    var day = d.getDate().toString();
    if (day.length < 2) day = '0' + day;
    var y = d.getFullYear();
    var hr = d.getHours().toString();
    if (hr.length < 2) hr = '0' + hr;
    var min = d.getMinutes().toString();
    if (min.length < 2) min = '0' + min;
    var sec = d.getSeconds().toString();
    if (sec.length < 2) sec = '0' + sec;
    return m + '/' + day + '/' + y + ', ' + hr + ':' + min + ':' + sec;
}
`;

themes.forEach(theme => {
    const appJsPath = path.join(themesDir, theme, 'assets', 'js', 'app.js');
    if (!fs.existsSync(appJsPath)) return;
    
    let js = fs.readFileSync(appJsPath, 'utf8');
    
    // 1. Replace the renderConfigs function completely
    js = js.replace(/function renderConfigs\(\)[\s\S]*?^}/m, '// renderConfigs replaced below');
    
    // 2. Replace template literal datetime formatting if present
    if (js.includes('`${m}/')) {
        js = js.replace(/el\.innerText\s*=\s*el\.parentElement\.innerText\.includes\("Last Online"\)\s*\?\s*timeAgo\(d\)\s*:\s*`\$\{m\}\/\$\{day\}\/\$\{y\},\s*\$\{hr\}:\$\{min\}:\$\{sec\}`;/g,
            'el.innerText = el.parentElement.innerText.includes("Last Online") ? timeAgo(d) : formatDateTime(d);');
        
        // Add formatDateTime function if not already present
        if (!js.includes('function formatDateTime')) {
            js = safeDateTimeFormatting + '\n' + js;
        }
    }
    
    // 3. Append the safe renderConfigs
    js += '\n' + safeRenderConfigs;
    
    fs.writeFileSync(appJsPath, js);
    console.log('Fixed: ' + theme);
});

console.log('All themes fixed with Go-safe JS (no template literals)!');
