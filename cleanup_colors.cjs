const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  content = content.replace(/bg-brand-500\/5 bg-brand-500\/10/g, 'bg-brand-500/10');
  content = content.replace(/bg-green-500\/5 bg-green-500\/10/g, 'bg-green-500/10');
  content = content.replace(/bg-purple-500\/5 bg-purple-500\/10/g, 'bg-purple-500/10');
  content = content.replace(/bg-orange-500\/5 bg-orange-500\/10/g, 'bg-orange-500/10');
  content = content.replace(/bg-red-500\/5 bg-red-500\/10/g, 'bg-red-500/10');
  
  content = content.replace(/bg-brand-500\/5 bg-brand-500\/5/g, 'bg-brand-500/10');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Cleaned up ${path.basename(file)}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx')) {
      processFile(filePath);
    }
  }
}

walkDir(pagesDir);
console.log('Done cleaning up pages');
