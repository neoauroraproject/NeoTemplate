document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initAvatar();
    initTrafficStats();
    initDaysStats(); renderConfigs();
});

function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    function applyTheme(isDark) {
        document.body.className = isDark ? 'theme-dark' : 'theme-light';
        localStorage.setItem('neo-glass-theme', document.body.className);
    }

    const savedTheme = localStorage.getItem('neo-glass-theme');
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

function initTrafficStats() {
    const rawData = document.getElementById('raw-data');
    if (!rawData) return;

    const upBytes = parseInt(rawData.getAttribute('data-up') || '0', 10);
    const downBytes = parseInt(rawData.getAttribute('data-down') || '0', 10);
    const totalBytes = parseInt(rawData.getAttribute('data-total') || '0', 10);

    const usedBytes = upBytes + downBytes;
    
    const heroValEl = document.getElementById('hero-rem-val');
    const heroUnitEl = document.getElementById('hero-rem-unit');
    const bar = document.getElementById('progress-bar');
    
    if (totalBytes === 0) {
        if (heroValEl) heroValEl.innerText = "Unlimited";
        if (heroUnitEl) heroUnitEl.innerText = "";
        if (bar) bar.style.width = '100%';
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
        if (bar) {
            setTimeout(() => {
                bar.style.width = percentage + '%';
                if(percentage > 90) bar.style.backgroundColor = 'var(--danger)';
                else if(percentage > 75) bar.style.backgroundColor = 'var(--warning)';
            }, 300);
        }
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0.00 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function initDaysStats() {
    const rawData = document.getElementById('raw-data');
    const daysLeftEl = document.getElementById('days-left');
    const advExpiryEl = document.getElementById('adv-expiry');
    if (!rawData) return;

    const expireSeconds = parseInt(rawData.getAttribute('data-expire') || '0', 10);
    
    if (expireSeconds === 0) {
        if(daysLeftEl) daysLeftEl.innerText = "∞";
        if(advExpiryEl) advExpiryEl.innerText = "Unlimited";
        return;
    }

    const expiryDate = new Date(expireSeconds * 1000);
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if(daysLeftEl) {
        if (diffDays < 0) {
            daysLeftEl.innerText = "0";
            daysLeftEl.style.color = "var(--danger)";
        } else {
            daysLeftEl.innerText = diffDays;
        }
    }
    
    if(advExpiryEl) {
        advExpiryEl.innerText = expiryDate.toLocaleDateString();
    }
}

function copyToClipboard(text, msg) {
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
    
    modal.classList.add('open');
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
