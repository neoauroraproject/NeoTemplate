/**
 * NeoTemplate SDK - Modular JavaScript
 * 
 * Provides standard interactive features for themes without relying on any external frameworks.
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle(); renderConfigs();
    initTrafficFormatting();
    initProgressAnimation();
    initExpiryCalculation();
});

/**
 * Handles Dark/Light mode switching based on CSS classes.
 */
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Check saved preference or fallback to system preference
    const savedTheme = localStorage.getItem('neo-theme');
    if (savedTheme) {
        document.body.className = savedTheme;
    } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.className = prefersDark ? 'theme-dark' : 'theme-light';
    }

    toggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('theme-light')) {
            document.body.className = 'theme-dark';
            localStorage.setItem('neo-theme', 'theme-dark');
        } else {
            document.body.className = 'theme-light';
            localStorage.setItem('neo-theme', 'theme-light');
        }
    });
}

/**
 * Formats raw byte strings injected by 3x-ui into human readable formats (KB, MB, GB).
 */
function initTrafficFormatting() {
    const elements = document.querySelectorAll('[data-bytes]');
    elements.forEach(el => {
        const rawBytes = parseInt(el.getAttribute('data-bytes'), 10);
        if (isNaN(rawBytes)) return;
        
        if (rawBytes === 0) {
            // Already handled by HTML template logic if it means 'Unlimited'
            if (el.innerText === 'Unlimited') return;
            el.innerText = '0 B';
            return;
        }

        el.innerText = formatBytes(rawBytes);
    });
}

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
        remainingEl.innerText = 'No Expiration';
        return;
    }

    // 3x-ui gives timestamp in milliseconds usually, or if in seconds, multiply by 1000.
    // Assuming milliseconds for this template. If it looks like seconds (length 10), multiply.
    const isSeconds = timestamp.toString().length <= 10;
    const expiryDate = new Date(isSeconds ? timestamp * 1000 : timestamp);
    
    el.innerText = expiryDate.toLocaleDateString();

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
 * Public Helper: Copy text to clipboard and show notification.
 */
window.copyToClipboard = function copyToClipboard(text, msg) {
    if (!text) return;
    
    var showToast = function() {
        var toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = msg || 'Copied!';
            toast.style.display = 'block';
            toast.style.opacity = '1';
            setTimeout(function() { 
                toast.style.display = 'none'; 
            }, 2000);
        } else if (typeof showNotification === 'function') {
            showNotification(msg || 'Copied!');
        }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showToast).catch(function() {
            fallbackCopy(text, showToast);
        });
    } else {
        fallbackCopy(text, showToast);
    }
}

function fallbackCopy(text, callback) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        callback();
    } catch (err) {
        console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
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
/**
 * Public Helper: Show QR code in modal
 */
window.showQR = function(link, name) {
    const modal = document.getElementById('qr-modal');
    const title = document.getElementById('qr-title');
    const canvas = document.getElementById('qr-canvas');
    if (!modal || !title || !canvas) return;
    
    title.innerText = name;
    new QRious({
        element: canvas,
        value: link,
        size: 200,
        background: 'transparent',
        foreground: 'black'
    });
    
    modal.style.display = 'flex';
};

// Close modals on clicking outside overlay
document.addEventListener('click', function(e) {
    var actionModal = document.getElementById('action-modal');
    var qrModal = document.getElementById('qr-modal');
    var advModal = document.getElementById('adv-modal');
    
    if (e.target === actionModal) {
        actionModal.classList.remove('open');
        actionModal.style.display = 'none';
    }
    if (e.target === qrModal) {
        qrModal.classList.remove('open');
        qrModal.style.display = 'none';
    }
    if (e.target === advModal) {
        advModal.classList.remove('open');
        advModal.style.display = 'none';
    }
});
// === LANG ENHANCER START ===
(function() {
    const themeKeys = ['neo-theme', 'neo-dashboard-theme', 'neo-eclipse-theme', 'neo-glass-theme'];
    const hasSavedTheme = themeKeys.some(k => localStorage.getItem(k));
    if (!hasSavedTheme) {
        const hour = new Date().getHours();
        const isNight = hour >= 18 || hour < 6;
        const initialThemeClass = isNight ? 'theme-dark' : 'theme-light';
        themeKeys.forEach(k => localStorage.setItem(k, initialThemeClass));
        if (document.body) {
            document.body.className = initialThemeClass;
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.className = initialThemeClass;
            });
        }
    }

    const translations = {
        "Remaining Traffic": "ترافیک باقی‌مانده",
        "Used": "مصرف شده",
        "Total Used": "کل مصرف",
        "Days Left": "روزهای باقی‌مانده",
        "Days Remaining": "روزهای باقی‌مانده",
        "Days": "روز",
        "Advanced Information": "اطلاعات پیشرفته",
        "Advanced Info": "اطلاعات پیشرفته",
        "Status": "وضعیت",
        "Max Allowed": "حجم کلی",
        "Total Limit": "حجم کلی",
        "Total Quota": "حجم کلی",
        "Uploaded": "آپلود",
        "Downloaded": "دانلود",
        "Expiration": "تاریخ انقضا",
        "Expiration Date": "تاریخ انقضا",
        "Configurations": "کانفیگ‌ها",
        "Your Configurations": "کانفیگ‌های شما",
        "Powered by NeoTemplate": "قدرت گرفته از NeoTemplate",
        "Quick Actions": "عملیات سریع",
        "Copy Subscription Link": "کپی لینک سابسکریپشن",
        "Copy Subscription": "کپی لینک سابسکریپشن",
        "Import to V2RayNG / v2rayN": "ورود به V2RayNG / v2rayN",
        "Import to Shadowrocket / iOS": "ورود به Shadowrocket / iOS",
        "Support": "پشتیبانی",
        "Contact Support": "ارتباط با پشتیبانی",
        "Help & Support": "راهنما و پشتیبانی",
        "Client Profile": "پروفایل کاربر",
        "Profile": "پروفایل",
        "Email / Identifier": "ایمیل / شناسه",
        "Data Usage": "مصرف داده",
        "Unlimited": "نامحدود",
        "Never Expires": "بدون انقضا",
        "Close": "بستن",
        "Config": "کانفیگ",
        "Copy": "کپی",
        "QR": "کد QR",
        "Hi, ": "سلام، ",
        "Remaining Data": "ترافیک باقی‌مانده",
        "Active": "فعال",
        "Disabled": "غیرفعال",
        "Inactive": "غیرفعال",
        "No configs available": "کانفیگی در دسترس نیست",
        "Config Copied!": "کانفیگ کپی شد!",
        "URL Copied!": "لینک کپی شد!",
        "Link Copied!": "لینک کپی شد!",
        "Copy Link": "کپی لینک",
        "Dark Mode": "حالت تاریک",
        "Light Mode": "حالت روشن",
        "Days Remaining": "روزهای باقی‌مانده",
        "Never Expires": "بدون انقضا",
        "Contact Support →": "ارتباط با پشتیبانی ←",
        "Contact Support &rarr;": "ارتباط با پشتیبانی &rarr;"
    };

    const reverseTranslations = {};
    for (const k in translations) {
        reverseTranslations[translations[k]] = k;
    }

    function shouldSkipNode(node) {
        let parent = node.parentNode;
        while (parent) {
            if (parent.id === 'raw-links-container' || 
                parent.id === 'display-name' || 
                (parent.classList && parent.classList.contains('raw-link')) ||
                (parent.classList && parent.classList.contains('avatar')) ||
                parent.tagName === 'SCRIPT' || 
                parent.tagName === 'STYLE') {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    }

    function translateDOM(lang) {
        const map = lang === 'fa' ? translations : reverseTranslations;
        const walk = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walk.nextNode()) {
            if (shouldSkipNode(node)) continue;
            const text = node.nodeValue.trim();
            if (!text) continue;
            
            if (map[text]) {
                node.nodeValue = node.nodeValue.replace(text, map[text]);
            } else {
                // Sort keys by length descending to avoid partial matches
                const keys = Object.keys(map).sort((a, b) => b.length - a.length);
                for (const key of keys) {
                    if (text.includes(key) && key.length > 2) {
                        node.nodeValue = node.nodeValue.replace(key, map[key]);
                    }
                }
            }
        }

        if (lang === 'fa') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'fa';
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = 'en';
        }
    }

    function injectAssets() {
        if (!document.getElementById('vazir-font')) {
            const link = document.createElement('link');
            link.id = 'vazir-font';
            link.href = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            document.head.appendChild(link);
        }

        if (!document.getElementById('rtl-styles')) {
            const style = document.createElement('style');
            style.id = 'rtl-styles';
            style.innerHTML = `
                [dir="rtl"] {
                    font-family: 'Vazirmatn', system-ui, -apple-system, sans-serif !important;
                }
                [dir="rtl"] .accordion-icon, [dir="rtl"] .acc-icon {
                    transform: scaleX(-1);
                }
            `;
            document.head.appendChild(style);
        }
    }

    function initLangButton() {
        let target = document.getElementById('theme-toggle');
        if (!target) {
            target = document.querySelector('a[href*="Support"], a[href*="support"]');
        }
        if (!target || document.getElementById('lang-toggle')) return;

        const btn = document.createElement('button');
        btn.id = 'lang-toggle';
        btn.className = target.className;
        
        btn.style.cssText = window.getComputedStyle(target).cssText;
        btn.style.position = 'static';
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.marginRight = '8px';
        btn.style.marginLeft = '8px';
        btn.style.width = 'auto';
        btn.style.height = 'auto';
        btn.style.padding = '8px 12px';
        btn.style.borderRadius = '99px';
        btn.style.cursor = 'pointer';
        
        const currentLang = localStorage.getItem('neo-lang') || 'en';
        btn.innerText = currentLang === 'en' ? 'FA' : 'EN';
        
        btn.addEventListener('click', () => {
            const nextLang = localStorage.getItem('neo-lang') === 'fa' ? 'en' : 'fa';
            localStorage.setItem('neo-lang', nextLang);
            btn.innerText = nextLang === 'en' ? 'FA' : 'EN';
            
            translateDOM(nextLang);
            
            if (typeof window.renderConfigs === 'function') {
                window.renderConfigs();
            }
        });

        target.parentNode.insertBefore(btn, target);
    }

    const originalShowNotification = window.showNotification;
    if (typeof originalShowNotification === 'function') {
        window.showNotification = function(msg, type) {
            const currentLang = localStorage.getItem('neo-lang') || 'en';
            if (currentLang === 'fa' && translations[msg]) {
                msg = translations[msg];
            }
            originalShowNotification(msg, type);
        };
    }
    
    const originalCopyToClipboard = window.copyToClipboard;
    if (typeof originalCopyToClipboard === 'function') {
        window.copyToClipboard = function(text, msg) {
            const currentLang = localStorage.getItem('neo-lang') || 'en';
            if (currentLang === 'fa' && translations[msg]) {
                msg = translations[msg];
            }
            originalCopyToClipboard(text, msg);
        };
    }

    function run() {
        injectAssets();
        initLangButton();
        
        const currentLang = localStorage.getItem('neo-lang') || 'en';
        if (currentLang === 'fa') {
            translateDOM('fa');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
    
    const originalRenderConfigs = window.renderConfigs;
    if (typeof originalRenderConfigs === 'function') {
        window.renderConfigs = function() {
            originalRenderConfigs();
            const currentLang = localStorage.getItem('neo-lang') || 'en';
            if (currentLang === 'fa') {
                translateDOM('fa');
            }
        };
    }
})();
// === LANG ENHANCER END ===
