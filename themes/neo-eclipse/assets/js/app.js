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


// renderConfigs replaced below


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
        
        var safeName = name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        var safeLink = link.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        html += '<div style="background: var(--pill-bg, var(--bg-card, rgba(255,255,255,0.05))); border-radius: 16px; padding: 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(128,128,128,0.1); margin-bottom: 12px;">';
        html += '<div style="display:flex; align-items:center; gap: 12px; overflow: hidden; flex: 1;">';
        html += '<div style="min-width: 40px; height: 40px; border-radius: 12px; background: var(--accent, var(--primary, #3b82f6)); color: white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size: 0.7rem; text-transform: uppercase;">' + protocol.substring(0,5) + '</div>';
        html += '<div style="flex:1; overflow:hidden;">';
        html += '<div style="margin:0; font-size:0.9rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + safeName + '</div>';
        html += '<div style="margin:2px 0 0; font-size:0.7rem; opacity:0.6;">' + protocol + '</div>';
        html += '</div></div>';
        html += '<div style="display:flex; gap: 8px; margin-left: 12px;">';
        html += "<button onclick=\"copyToClipboard('" + safeLink + "', 'Config Copied!')\" style=\"background:var(--pill-hover, rgba(128,128,128,0.15)); border:none; color:inherit; padding:8px 12px; border-radius:10px; cursor:pointer; font-size:0.8rem; font-weight:600;\">Copy</button>";
        html += "<button onclick=\"showQR('" + safeLink + "', '" + safeName + "')\" style=\"background:var(--text-main, var(--text-primary, #000)); color:var(--bg-main, var(--bg-base, #fff)); border:none; padding:8px 12px; border-radius:10px; cursor:pointer; font-size:0.8rem; font-weight:600;\">QR</button>";
        html += '</div></div>';
    }
    container.innerHTML = html;
}
