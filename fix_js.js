const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname, 'themes');
const themes = ['neo-dashboard', 'neo-default', 'neo-eclipse', 'neo-glass', 'neo-minimal', 'neo-vibrant'];

themes.forEach(theme => {
    const appJsPath = path.join(themesDir, theme, 'assets', 'js', 'app.js');
    if (fs.existsSync(appJsPath)) {
        let content = fs.readFileSync(appJsPath, 'utf8');
        // Replace {{ with '{' + '{' to avoid Go template parser panic when JS is inlined
        content = content.replace(/'\{\{'/g, "'{' + '{'");
        content = content.replace(/"\{\{"/g, '"{" + "{"');
        fs.writeFileSync(appJsPath, content);
    }
});
console.log('Fixed JS template tags in all themes.');
