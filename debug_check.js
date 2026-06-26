const fs = require('fs');
const html = fs.readFileSync('build_temp/neo-vibrant/index.html', 'utf8');

// Find the last <script> block (the inlined app.js)
const scriptTag = html.lastIndexOf('<script>');
const endTag = html.lastIndexOf('</script>');
const js = html.substring(scriptTag, endTag);

const backtickCount = (js.match(/`/g) || []).length;
console.log('Backtick count in inline script:', backtickCount);

const dollarBraceCount = (js.match(/\$\{/g) || []).length;
console.log('${} interpolation count:', dollarBraceCount);

// Check if there are any Go template-like patterns that could confuse the engine
const goTemplateInJS = (js.match(/\{\{/g) || []).length;
console.log('{{ count in inline script:', goTemplateInJS);

// Show lines with backticks
const lines = js.split('\n');
lines.forEach((line, i) => {
    if (line.includes('`')) {
        console.log(`Line ${i}: ${line.trim().substring(0, 120)}`);
    }
});
