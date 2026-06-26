const fs = require('fs');

function applyUserFeedback(theme) {
    const htmlPath = 'themes/' + theme + '/index.html';
    if (!fs.existsSync(htmlPath)) return;
    
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Add "Client: " before the email display in neo-vibrant
    if (theme === 'neo-vibrant' && !html.includes('Client:')) {
        html = html.replace('id="display-name">', 'id="display-name"><span style="opacity:0.6; font-size:0.8rem; font-weight:400; margin-right:4px;">Client:</span>');
        
        // Add a visible support button next to the theme toggle
        if (html.includes('<!-- Sun/Moon Icon -->') && !html.includes('Support</a>')) {
            const supportBtn = `
            <a href="{{ .subSupportUrl }}" target="_blank" style="display:flex; align-items:center; gap:6px; background:var(--primary); color:white; text-decoration:none; padding:8px 16px; border-radius:12px; font-weight:600; font-size:0.875rem; margin-right:12px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                Support
            </a>
            `;
            html = html.replace('<button id="theme-toggle"', supportBtn + '\n            <button id="theme-toggle"');
        }
    }
    
    // Add Client: prefix for neo-eclipse
    if (theme === 'neo-eclipse' && !html.includes('Client:')) {
        if (html.includes('class="user-email"')) {
            html = html.replace('class="user-email">', 'class="user-email"><span style="opacity:0.5; margin-right:4px;">Client:</span>');
        }
        
        // Ensure support button is visible on eclipse
        if (!html.includes('Contact Support</a>') && !html.includes('Support</a>')) {
            const supportBtn = `
            <a href="{{ .subSupportUrl }}" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:var(--accent); color:var(--bg-main); text-decoration:none; padding:8px 16px; border-radius:99px; font-weight:600; font-size:0.875rem; margin-left:12px;">
                Support
            </a>
            `;
            html = html.replace('class="brand-title">{{ .subTitle }}</div>', 'class="brand-title">{{ .subTitle }}' + supportBtn + '</div>');
        }
    }
    
    fs.writeFileSync(htmlPath, html);
    console.log('Applied feedback to ' + theme);
}

['neo-vibrant', 'neo-eclipse'].forEach(applyUserFeedback);
