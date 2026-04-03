const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let found = false;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('.map(')) {
      let hasKey = false;
      let returnsJSX = false;
      
      for (let k = i; k < Math.min(i + 15, lines.length); k++) {
        if (lines[k].includes('key=')) {
          hasKey = true;
          break;
        }
        if (lines[k].match(/<[A-Za-z]+/)) {
          returnsJSX = true;
        }
      }
      
      if (!hasKey && returnsJSX) {
        console.log(`${file}:${i + 1}: ${lines[i].trim()}`);
        found = true;
      }
    }
  }
});

if (!found) console.log("No missing keys found with naive check.");
