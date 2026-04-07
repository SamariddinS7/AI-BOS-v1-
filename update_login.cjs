const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/Login.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/bg-slate-50 dark:bg-black/g, 'bg-app-bg');
content = content.replace(/bg-blue-600\/20/g, 'bg-brand-500/20');
content = content.replace(/bg-purple-600\/20/g, 'bg-purple-500/20');
content = content.replace(/bg-white dark:bg-gray-900/g, 'bg-surface-card');
content = content.replace(/dark:border-gray-800/g, 'border-border-dark');
content = content.replace(/bg-blue-600/g, 'bg-brand-500');
content = content.replace(/shadow-blue-600\/30/g, 'shadow-brand-500/30');
content = content.replace(/bg-gray-50 dark:bg-gray-800/g, 'bg-surface-ground');
content = content.replace(/border-gray-200 dark:border-gray-700/g, 'border-border-dark');
content = content.replace(/focus:bg-white dark:focus:bg-gray-700/g, 'focus:bg-surface-dark');
content = content.replace(/focus:border-blue-600/g, 'focus:border-brand-500');
content = content.replace(/focus:ring-blue-600\/10/g, 'focus:ring-brand-500/10');
content = content.replace(/dark:text-gray-100/g, 'text-text-primary');
content = content.replace(/hover:bg-blue-700/g, 'hover:bg-brand-600');
content = content.replace(/focus:ring-blue-600\/20/g, 'focus:ring-brand-500/20');
content = content.replace(/bg-white dark:bg-gray-800/g, 'bg-surface-card');
content = content.replace(/text-gray-700 dark:text-gray-300/g, 'text-text-primary');
content = content.replace(/hover:bg-gray-50 dark:hover:bg-gray-700/g, 'hover:bg-surface-dark');
content = content.replace(/hover:border-gray-300 dark:hover:border-gray-600/g, 'hover:border-border-glow');
content = content.replace(/focus:ring-gray-100 dark:focus:ring-gray-800/g, 'focus:ring-border-dark');
content = content.replace(/bg-gray-50 dark:bg-gray-800\/50/g, 'bg-surface-ground');
content = content.replace(/border-gray-100 dark:border-gray-800/g, 'border-border-dark');
content = content.replace(/text-gray-900 dark:text-white/g, 'text-text-primary');
content = content.replace(/text-gray-500 dark:text-gray-400/g, 'text-text-muted');
content = content.replace(/text-gray-400 dark:text-gray-500/g, 'text-text-muted');
content = content.replace(/text-blue-600 dark:text-blue-400/g, 'text-brand-500');
content = content.replace(/hover:text-blue-700 dark:hover:text-blue-300/g, 'hover:text-brand-400');

fs.writeFileSync(file, content);
console.log('Done Login.tsx');
