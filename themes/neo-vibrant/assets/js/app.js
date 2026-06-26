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
    initDateTimeFormatting();
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
        
        el.innerText = `${m}/${day}/${y}, ${hr}:${min}:${sec}`;
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
