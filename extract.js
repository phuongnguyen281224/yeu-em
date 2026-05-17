const fs = require('fs');
const html = fs.readFileSync('birthday.html', 'utf-8');

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
  fs.writeFileSync('react-app/src/index.css', styleMatch[1].trim());
  console.log('Extracted index.css');
}

const dataMatch = html.match(/const DATA\s*=\s*(\[[\s\S]*?\]);/);
if (dataMatch) {
  fs.writeFileSync('react-app/src/data.js', `export const DATA = ${dataMatch[1]};`);
  console.log('Extracted data.js');
}

// Extract HTML structure if needed
const htmlMatch = html.match(/<body>([\s\S]*?)<script>/);
if (htmlMatch) {
  fs.writeFileSync('react-app/src/template.html', htmlMatch[1].trim());
  console.log('Extracted template.html');
}
