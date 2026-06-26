const fs = require('fs');
const themes = ['neo-vibrant','neo-eclipse','neo-default','neo-glass','neo-minimal','neo-dashboard'];
themes.forEach(t => {
    const js = fs.readFileSync('themes/' + t + '/assets/js/app.js', 'utf8');
    const bt = (js.match(/`/g) || []).length;
    console.log(t + ': backticks=' + bt + ', has renderConfigs=' + js.includes('function renderConfigs'));
});
