
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

/**
 * NeoTemplate SDK - Modular JavaScript
 * 
 * Provides standard interactive features for themes without relying on any external frameworks.
 */

/**
 * Formats raw byte strings injected by 3x-ui into human readable formats (KB, MB, GB).
 */
function initTrafficFormatting() {
    // Format all simple data-bytes elements
    const elements = document.querySelectorAll('[data-bytes]');
    elements.forEach(el => {
        const rawBytes = parseInt(el.getAttribute('data-bytes'), 10);
        if (isNaN(rawBytes)) return;
        
        if (rawBytes === 0 && el.innerText === 'Unlimited') return;

        el.innerText = formatBytes(rawBytes);
    });

    // Handle Hero Card specific logic
    const rawDataEl = document.getElementById('raw-data');
    if (rawDataEl) {
        const up = parseInt(rawDataEl.getAttribute('data-up') || '0', 10);
        const down = parseInt(rawDataEl.getAttribute('data-down') || '0', 10);
        const total = parseInt(rawDataEl.getAttribute('data-total') || '0', 10);
        
        const largeNumEl = document.getElementById('hero-large-number');
        const largeUnitEl = document.getElementById('hero-large-unit');
        const largeLabelEl = document.getElementById('hero-large-label');

        if (total === 0) {
            // Unlimited: Show used traffic
            const used = up + down;
            const formatted = formatBytes(used).split(' ');
            largeNumEl.innerText = formatted[0];
            largeUnitEl.innerText = formatted[1] || '';
            largeLabelEl.innerText = "Used Traffic (Unlimited Limit)";
        } else {
            // Limited: Show remaining traffic
            const used = up + down;
            const remaining = total - used;
            const finalRemaining = remaining > 0 ? remaining : 0;
            const formatted = formatBytes(finalRemaining).split(' ');
            
            largeNumEl.innerText = formatted[0];
            largeUnitEl.innerText = formatted[1] || '';
            largeLabelEl.innerText = "Remaining Traffic";
        }
    }
}

/**
 * Handle initial user avatar logic
 */
function initAvatar() {
    const nameEl = document.getElementById('display-name');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl && avatarEl) {
        const name = nameEl.innerText.trim();
        if (name && !name.includes('{' + '{')) {
            avatarEl.innerText = name.charAt(0).toUpperCase();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initTrafficFormatting();
    initAvatar();
    initProgressAnimation();
    initExpiryCalculation();
    initDateTimeFormatting(); renderConfigs();
});

/**
 * Converts bytes to readable string
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Animates the progress bar based on Up/Down/Total variables injected by 3x-ui.
 */
function initProgressAnimation() {
    const bar = document.getElementById('traffic-progress-bar');
    const text = document.getElementById('traffic-percentage');
    if (!bar || !text) return;

    const up = parseInt(bar.getAttribute('data-up') || '0', 10);
    const down = parseInt(bar.getAttribute('data-down') || '0', 10);
    const total = parseInt(bar.getAttribute('data-total') || '0', 10);

    if (total === 0) {
        text.innerText = 'Unlimited Data';
        bar.style.width = '100%';
        bar.style.backgroundColor = 'var(--success)';
        return;
    }

    const used = up + down;
    let percentage = (used / total) * 100;
    
    // Cap at 100%
    if (percentage > 100) percentage = 100;

    // Animate via CSS transition
    setTimeout(() => {
        bar.style.width = percentage + '%';
        
        // Change color based on usage
        if (percentage > 90) {
            bar.style.backgroundColor = 'var(--danger)';
        } else if (percentage > 75) {
            bar.style.backgroundColor = 'var(--warning)';
        }
        
        text.innerText = percentage.toFixed(1) + '% Used';
    }, 100);
}

/**
 * Calculates remaining days from the Unix timestamp.
 */
function initExpiryCalculation() {
    const el = document.querySelector('.date-value');
    const remainingEl = document.getElementById('days-remaining');
    if (!el || !remainingEl) return;

    const timestamp = parseInt(el.getAttribute('data-timestamp'), 10);
    if (isNaN(timestamp) || timestamp === 0) {
        remainingEl.innerText = 'Unlimited Expiration';
        return;
    }

    // .expire in 3x-ui sub is in seconds.
    const expiryDate = new Date(timestamp * 1000);

    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays < 0) {
        remainingEl.innerText = 'Expired';
        remainingEl.style.color = 'var(--danger)';
    } else {
        remainingEl.innerText = diffDays + ' days remaining';
        if (diffDays <= 3) {
            remainingEl.style.color = 'var(--danger)';
        }
    }
}

/**
 * Formats datetime values for Advanced Information
 */
function initDateTimeFormatting() {
    const elements = document.querySelectorAll('.datetime-value');
    elements.forEach(el => {
        let ts = 0;
        if (el.hasAttribute('data-ms')) {
            ts = parseInt(el.getAttribute('data-ms'), 10);
        } else if (el.hasAttribute('data-s')) {
            ts = parseInt(el.getAttribute('data-s'), 10) * 1000;
        }
        
        if (isNaN(ts) || ts <= 0) {
            el.innerText = '-';
            return;
        }
        
        const d = new Date(ts);
        // Format exactly like: 07/26/2026, 14:14:04
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const y = d.getFullYear();
        const hr = d.getHours().toString().padStart(2, '0');
        const min = d.getMinutes().toString().padStart(2, '0');
        const sec = d.getSeconds().toString().padStart(2, '0');
        
        el.innerText = el.parentElement.innerText.includes("Last Online") ? timeAgo(d) : formatDateTime(d);
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

/**
 * Handles Dark/Light mode switching based on CSS classes.
 */
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const iconLight = toggleBtn.querySelector('.theme-icon-light');
    const iconDark = toggleBtn.querySelector('.theme-icon-dark');

    function applyTheme(isDark) {
        document.body.className = isDark ? 'theme-dark' : 'theme-light';
        localStorage.setItem('neo-theme', document.body.className);
        
        if (iconLight && iconDark) {
            iconLight.style.display = isDark ? 'none' : 'block';
            iconDark.style.display = isDark ? 'block' : 'none';
        }
    }

    // Check saved preference or fallback to system preference
    const savedTheme = localStorage.getItem('neo-theme');
    if (savedTheme) {
        applyTheme(savedTheme === 'theme-dark');
    } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark);
    }

    toggleBtn.addEventListener('click', () => {
        const isCurrentlyDark = document.body.classList.contains('theme-dark');
        applyTheme(!isCurrentlyDark);
    });
}

/**
 * Public Helper: Copy text to clipboard and show notification.
 */
window.copyToClipboard = function(text, successMessage = 'Copied!') {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification(successMessage);
        }).catch(err => {
            console.error('Could not copy text: ', err);
            showNotification('Failed to copy', 'error');
        });
    } else {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification(successMessage);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    }
};

/**
 * Public Helper: Toggle Accordion (FAQ/Help sections)
 */
window.toggleAccordion = function(button) {
    const item = button.parentElement;
    item.classList.toggle('active');
};

/**
 * Public Helper: Show toast notification
 */
window.showNotification = function(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'notification';
    toast.innerText = message;
    
    if (type === 'error') {
        toast.style.backgroundColor = 'var(--danger)';
    }

    container.appendChild(toast);

    // Trigger reflow for animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300); // match CSS transition duration
    }, 3000);
};

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
