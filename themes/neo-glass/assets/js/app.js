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

function collectClientEmails() {
    var emails = [];
    var nodes = document.querySelectorAll('#client-emails-container .client-email');
    for (var i = 0; i < nodes.length; i++) {
        var t = nodes[i].innerText.trim();
        if (t) emails.push(t);
    }
    return emails;
}

function decodeBase64Utf8(str) {
    var s = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    try {
        var binary = atob(s);
        if (typeof TextDecoder !== 'undefined') {
            var bytes = new Uint8Array(binary.length);
            for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return new TextDecoder('utf-8').decode(bytes);
        }
        return decodeURIComponent(escape(binary));
    } catch (e) {
        return '';
    }
}

function parseQueryParams(qs) {
    var out = {};
    if (!qs) return out;
    var parts = qs.split('&');
    for (var i = 0; i < parts.length; i++) {
        var pair = parts[i];
        if (!pair) continue;
        var eq = pair.indexOf('=');
        var k = eq === -1 ? pair : pair.substring(0, eq);
        var v = eq === -1 ? '' : pair.substring(eq + 1);
        try { k = decodeURIComponent(k); } catch (e) {}
        try { v = decodeURIComponent(v); } catch (e) {}
        out[String(k).toLowerCase()] = v;
    }
    return out;
}

function parseHostPort(hostPort) {
    var result = { address: '', port: '' };
    if (!hostPort) return result;
    if (hostPort.charAt(0) === '[') {
        var end = hostPort.indexOf(']');
        if (end !== -1) {
            result.address = hostPort.substring(1, end);
            if (hostPort.charAt(end + 1) === ':') result.port = hostPort.substring(end + 2);
            return result;
        }
    }
    var colon = hostPort.lastIndexOf(':');
    if (colon !== -1 && hostPort.indexOf(':') === colon) {
        result.address = hostPort.substring(0, colon);
        result.port = hostPort.substring(colon + 1);
    } else {
        result.address = hostPort;
    }
    return result;
}

function parseShareLink(link) {
    var result = { protocol: 'vpn', address: '', port: '', sni: '', hostHeader: '', remark: '' };
    if (!link) return result;
    var hashIndex = link.indexOf('#');
    var withoutHash = link;
    if (hashIndex !== -1) {
        try {
            result.remark = decodeURIComponent(link.substring(hashIndex + 1).replace(/\+/g, '%20'));
        } catch (e) {
            result.remark = link.substring(hashIndex + 1);
        }
        withoutHash = link.substring(0, hashIndex);
    }
    var protoIndex = withoutHash.indexOf('://');
    if (protoIndex === -1) return result;
    result.protocol = withoutHash.substring(0, protoIndex).toLowerCase();
    var rest = withoutHash.substring(protoIndex + 3);

    if (result.protocol === 'vmess') {
        try {
            var json = JSON.parse(decodeBase64Utf8(rest));
            result.address = json.add || json.address || '';
            result.port = String(json.port || '');
            result.sni = json.sni || '';
            result.hostHeader = json.host || '';
            if (json.ps) result.remark = String(json.ps);
        } catch (e) {}
        return result;
    }

    var qIndex = rest.indexOf('?');
    var query = {};
    if (qIndex !== -1) {
        query = parseQueryParams(rest.substring(qIndex + 1));
        rest = rest.substring(0, qIndex);
    }
    result.sni = query.sni || query.peer || query.servername || '';
    result.hostHeader = query.host || '';

    var at = rest.lastIndexOf('@');
    var hostPort = at !== -1 ? rest.substring(at + 1) : rest;
    var hp = parseHostPort(hostPort);
    result.address = hp.address;
    result.port = hp.port;

    if (!result.address && (result.protocol === 'ss' || result.protocol === 'ssr')) {
        var decoded = decodeBase64Utf8(at !== -1 ? rest.substring(0, at) : rest);
        var decodedAt = decoded.lastIndexOf('@');
        if (decodedAt !== -1) {
            hp = parseHostPort(decoded.substring(decodedAt + 1));
            result.address = hp.address;
            result.port = hp.port;
        }
    }
    return result;
}

function isPrivateOrLocalHost(address) {
    if (!address) return true;
    return /^(127\.|0\.|localhost$|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|0:0:0:0:0:0:0:1$)/i.test(address);
}

function pickHost(parsed) {
    var addr = (parsed.address || '').trim();
    var sni = (parsed.sni || parsed.hostHeader || '').trim();
    if (addr && !isPrivateOrLocalHost(addr)) return addr;
    if (sni) return sni;
    return addr;
}

function stripEmailFromRemark(remark, emails) {
    var name = remark;
    for (var i = 0; i < emails.length; i++) {
        var email = emails[i];
        if (!email) continue;
        if (name === email) return '';
        var suffixes = ['-' + email, '_' + email, ' ' + email, '|' + email, '/' + email];
        for (var j = 0; j < suffixes.length; j++) {
            var p = suffixes[j];
            if (name.length > p.length && name.substring(name.length - p.length) === p) {
                name = name.substring(0, name.length - p.length).trim();
            }
        }
    }
    return name.trim();
}

function configDisplayName(parsed, emails) {
    var host = pickHost(parsed);
    var remark = (parsed.remark || '').trim();
    if (!remark) return host;
    if (!emails.length) return host || remark;
    for (var i = 0; i < emails.length; i++) {
        if (remark === emails[i]) return host || remark;
    }
    var stripped = stripEmailFromRemark(remark, emails);
    if (stripped) {
        for (var k = 0; k < emails.length; k++) {
            if (stripped === emails[k]) return host || remark;
        }
        return stripped;
    }
    return host || remark;
}

function uniquifyConfigNames(items) {
    function recount() {
        var counts = {};
        for (var i = 0; i < items.length; i++) {
            counts[items[i].name] = (counts[items[i].name] || 0) + 1;
        }
        return counts;
    }
    var counts = recount();
    for (var i = 0; i < items.length; i++) {
        if (counts[items[i].name] > 1 && items[i].parsed.port) {
            items[i].name = items[i].name + ':' + items[i].parsed.port;
        }
    }
    counts = recount();
    for (var j = 0; j < items.length; j++) {
        if (counts[items[j].name] > 1 && items[j].protocol) {
            items[j].name = items[j].name + ' ' + items[j].protocol;
        }
    }
}

function applyConfigName(link, name) {
    if (!link || !name) return link;
    var protoIndex = link.indexOf('://');
    var protocol = protoIndex === -1 ? '' : link.substring(0, protoIndex).toLowerCase();
    if (protocol === 'vmess') {
        var hashIndex = link.indexOf('#');
        var body = hashIndex === -1 ? link.substring(8) : link.substring(8, hashIndex);
        try {
            var json = JSON.parse(decodeBase64Utf8(body));
            json.ps = name;
            var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(json))));
            return 'vmess://' + encoded + '#' + encodeURIComponent(name);
        } catch (e) {}
    }
    var hash = link.indexOf('#');
    var base = hash === -1 ? link : link.substring(0, hash);
    return base + '#' + encodeURIComponent(name);
}




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

    var emails = collectClientEmails();
    var items = [];
    for (var j = 0; j < rawLinks.length; j++) {
        var parsed = parseShareLink(rawLinks[j]);
        items.push({
            raw: rawLinks[j],
            parsed: parsed,
            protocol: parsed.protocol || 'vpn',
            name: configDisplayName(parsed, emails) || ('Config ' + (j + 1))
        });
    }
    uniquifyConfigNames(items);

    var html = '';
    for (var j = 0; j < items.length; j++) {
        var name = items[j].name;
        var protocol = items[j].protocol;
        var link = applyConfigName(items[j].raw, name);
        
        var safeName = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        var safeLink = link.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
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
        "days remaining": "روز باقی‌مانده",
        "days left": "روز باقی‌مانده",
        "Days": "روز",
        "days": "روز",
        "days ago": "روز پیش",
        "hours ago": "ساعت پیش",
        "minutes ago": "دقیقه پیش",
        "seconds ago": "ثانیه پیش",
        "months ago": "ماه پیش",
        "years ago": "سال پیش",
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
                parent.id === 'client-emails-container' ||
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
        if (!document.getElementById('rtl-styles')) {
            // 1. Preload Vazirmatn font-face files
            const linkPreload1 = document.createElement('link');
            linkPreload1.rel = 'preload';
            linkPreload1.href = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2';
            linkPreload1.as = 'font';
            linkPreload1.type = 'font/woff2';
            linkPreload1.crossOrigin = 'anonymous';
            document.head.appendChild(linkPreload1);

            const linkPreload2 = document.createElement('link');
            linkPreload2.rel = 'preload';
            linkPreload2.href = 'https://unpkg.com/vazirmatn@33.0.3/fonts/webfonts/Vazirmatn-Regular.woff2';
            linkPreload2.as = 'font';
            linkPreload2.type = 'font/woff2';
            linkPreload2.crossOrigin = 'anonymous';
            document.head.appendChild(linkPreload2);

            // 2. Inject Stylesheet with @font-face and overrides
            const style = document.createElement('style');
            style.id = 'rtl-styles';
            style.innerHTML = `
                @font-face {
                    font-family: 'Vazirmatn';
                    src: url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2') format('woff2'),
                         url('https://unpkg.com/vazirmatn@33.0.3/fonts/webfonts/Vazirmatn-Regular.woff2') format('woff2');
                    font-weight: 400;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: 'Vazirmatn';
                    src: url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Medium.woff2') format('woff2'),
                         url('https://unpkg.com/vazirmatn@33.0.3/fonts/webfonts/Vazirmatn-Medium.woff2') format('woff2');
                    font-weight: 500;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: 'Vazirmatn';
                    src: url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Bold.woff2') format('woff2'),
                         url('https://unpkg.com/vazirmatn@33.0.3/fonts/webfonts/Vazirmatn-Bold.woff2') format('woff2');
                    font-weight: 700;
                    font-style: normal;
                    font-display: swap;
                }
                [dir="rtl"], [dir="rtl"] * {
                    font-family: 'Vazirmatn', system-ui, -apple-system, sans-serif !important;
                }
                [dir="rtl"] .accordion-icon, [dir="rtl"] .acc-icon {
                    transform: scaleX(-1);
                }
            `;
            document.head.appendChild(style);

            // 3. Create a hidden element to trigger immediate download of Vazirmatn font
            const fontLoader = document.createElement('div');
            fontLoader.style.cssText = 'font-family: "Vazirmatn"; position: absolute; top: -9999px; left: -9999px; opacity: 0; pointer-events: none;';
            fontLoader.innerText = 'فونت وزیر';
            document.body.appendChild(fontLoader);
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
