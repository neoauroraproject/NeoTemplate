document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initAvatar();
    initTrafficStats();
    initDaysStats(); renderConfigs();
});

/**
 * Handles Dark/Light mode switching.
 */
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    function applyTheme(isDark) {
        document.body.className = isDark ? 'theme-dark' : 'theme-light';
        localStorage.setItem('neo-eclipse-theme', document.body.className);
    }

    const savedTheme = localStorage.getItem('neo-eclipse-theme');
    if (savedTheme) {
        applyTheme(savedTheme === 'theme-dark');
    } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark);
    }

    toggleBtn.addEventListener('click', () => {
        applyTheme(document.body.className === 'theme-light');
    });
}

/**
 * Generates an avatar from the first letter of the display name.
 */
function initAvatar() {
    const nameEl = document.getElementById('display-name');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl && avatarEl) {
        const name = nameEl.innerText.trim();
        if (name.length > 0) {
            avatarEl.innerText = name.charAt(0).toUpperCase();
        }
    }
}

/**
 * Formats bytes to human readable, updates the Hero Data Meter and Progress Bar.
 */
function initTrafficStats() {
    const rawData = document.getElementById('raw-data');
    if (!rawData) return;

    const upBytes = parseInt(rawData.getAttribute('data-up') || '0', 10);
    const downBytes = parseInt(rawData.getAttribute('data-down') || '0', 10);
    const totalBytes = parseInt(rawData.getAttribute('data-total') || '0', 10);

    const usedBytes = upBytes + downBytes;
    
    // Update Hero Values
    const heroValEl = document.getElementById('hero-rem-val');
    const heroUnitEl = document.getElementById('hero-rem-unit');
    
    if (totalBytes === 0) {
        // Unlimited
        if (heroValEl) heroValEl.innerText = "Unlimited";
        if (heroUnitEl) heroUnitEl.innerText = "data";
        animateProgress(100);
    } else {
        const remBytes = Math.max(0, totalBytes - usedBytes);
        const formatted = formatBytes(remBytes);
        if (heroValEl && heroUnitEl) {
            const parts = formatted.split(' ');
            heroValEl.innerText = parts[0];
            heroUnitEl.innerText = parts[1];
        }
        
        let percentage = (usedBytes / totalBytes) * 100;
        if (percentage > 100) percentage = 100;
        // The green bar represents remaining data in this Fintech view (or used? Usually green = good = remaining).
        // Let's make the green bar show REMAINING data percentage.
        let remPercentage = 100 - percentage;
        animateProgress(remPercentage);
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0.00 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function animateProgress(targetPercentage) {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    
    // Slight delay for premium feel
    setTimeout(() => {
        bar.style.width = targetPercentage + '%';
        if(targetPercentage < 10) {
            bar.style.background = 'var(--danger)'; // Red if low
        }
    }, 300);
}

/**
 * Calculates days left and mocks days in.
 */
function initDaysStats() {
    const rawData = document.getElementById('raw-data');
    const daysLeftEl = document.getElementById('days-left');
    const daysInEl = document.getElementById('days-in');
    if (!rawData || !daysLeftEl) return;

    const expireSeconds = parseInt(rawData.getAttribute('data-expire') || '0', 10);
    
    if (expireSeconds === 0) {
        daysLeftEl.innerText = "∞";
        if(daysInEl) daysInEl.innerText = "-";
        return;
    }

    const expiryDate = new Date(expireSeconds * 1000);
    const now = new Date();
    
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        daysLeftEl.innerText = "0";
        daysLeftEl.style.color = "var(--danger)";
    } else {
        daysLeftEl.innerText = diffDays;
    }
    
    const advExpiryEl = document.getElementById('adv-expiry');
    if (advExpiryEl) {
        advExpiryEl.innerText = expiryDate.toLocaleDateString();
    }
}

/**
 * Utility to copy text to clipboard
 */
function copyToClipboard(text, successMsg) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = successMsg || 'Copied!';
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 2000);
        }
    });
}

function showQR(link, name) {
    const modal = document.getElementById('qr-modal');
    const title = document.getElementById('qr-title');
    const canvas = document.getElementById('qr-canvas');
    if (!modal || !title || !canvas) return;
    
    title.innerText = name;
    
    new QRious({
        element: canvas,
        value: link,
        size: 200,
        background: 'white',
        foreground: 'black'
    });
    
    modal.style.display = 'flex';
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + " years ago";
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hours ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}


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
        
        card.innerHTML = `
            <div style="display:flex; align-items:center; gap: 12px; overflow: hidden; flex: 1;">
                <div style="width: 40px; height: 40px; border-radius: 12px; background: var(--primary, #3b82f6); color: white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size: 0.75rem; text-transform: uppercase;">${protocol.substring(0,4)}</div>
                <div style="flex:1; overflow:hidden;">
                    <h4 style="margin:0; font-size:1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color: var(--text-main, inherit);">${name}</h4>
                    <p style="margin:2px 0 0; font-size:0.75rem; color: var(--text-sub, #999);">${protocol}</p>
                </div>
            </div>
            <div style="display:flex; gap: 8px; margin-left: 12px;">
                <button onclick="copyToClipboard('${link}', 'Config Copied!')" style="background:var(--bg-main, transparent); border:1px solid var(--card-border, rgba(0,0,0,0.1)); color:var(--text-main, inherit); padding:8px; border-radius:8px; cursor:pointer;">Copy</button>
                <button onclick="showQR('${link}', '${name}')" style="background:var(--text-main, #000); color:var(--bg-main, #fff); border:none; padding:8px; border-radius:8px; cursor:pointer;">QR</button>
            </div>
        `;
        container.appendChild(card);
    });
}
