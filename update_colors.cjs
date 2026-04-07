const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace common hardcoded colors with theme variables
  content = content.replace(/bg-blue-50(?!0)/g, 'bg-brand-500/5');
  content = content.replace(/dark:bg-blue-900\/20/g, 'bg-brand-500/10');
  content = content.replace(/dark:bg-blue-900\/10/g, 'bg-brand-500/5');
  content = content.replace(/text-blue-600/g, 'text-brand-500');
  
  content = content.replace(/bg-green-50(?!0)/g, 'bg-green-500/5');
  content = content.replace(/dark:bg-green-900\/20/g, 'bg-green-500/10');
  content = content.replace(/text-green-600/g, 'text-green-500');
  content = content.replace(/dark:text-green-400/g, 'text-green-400');
  
  content = content.replace(/bg-red-50(?!0)/g, 'bg-red-500/5');
  content = content.replace(/dark:bg-red-900\/20/g, 'bg-red-500/10');
  content = content.replace(/text-red-600/g, 'text-red-500');
  content = content.replace(/dark:text-red-400/g, 'text-red-400');
  
  content = content.replace(/bg-purple-50(?!0)/g, 'bg-purple-500/5');
  content = content.replace(/dark:bg-purple-900\/20/g, 'bg-purple-500/10');
  
  content = content.replace(/bg-orange-50(?!0)/g, 'bg-orange-500/5');
  content = content.replace(/dark:bg-orange-900\/20/g, 'bg-orange-500/10');
  
  content = content.replace(/bg-brand-50(?!0)/g, 'bg-brand-500/5');
  content = content.replace(/dark:bg-brand-900\/20/g, 'bg-brand-500/10');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${path.basename(file)}`);
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
console.log('Done replacing colors in pages');
