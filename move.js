const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'react-app');
const target = __dirname;

const files = fs.readdirSync(source);
for (const file of files) {
  fs.renameSync(path.join(source, file), path.join(target, file));
}
// Also move .gitignore if it exists
if (fs.existsSync(path.join(source, '.gitignore'))) {
  fs.renameSync(path.join(source, '.gitignore'), path.join(target, '.gitignore'));
}
if (fs.existsSync(path.join(source, '.eslintrc.cjs'))) {
  fs.renameSync(path.join(source, '.eslintrc.cjs'), path.join(target, '.eslintrc.cjs'));
}
fs.rmdirSync(source);
console.log('Moved files successfully');
