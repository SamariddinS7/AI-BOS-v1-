const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/AIRecommendations.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/bg-white\/5/g, 'bg-surface-card');
content = content.replace(/bg-white\/10/g, 'bg-surface-layer');
content = content.replace(/border-white\/10/g, 'border-border-dark');
content = content.replace(/border-white\/20/g, 'border-border-glow');
content = content.replace(/text-gray-300/g, 'text-text-primary');
content = content.replace(/text-gray-400/g, 'text-text-secondary');
content = content.replace(/text-enterprise-muted/g, 'text-text-muted');
content = content.replace(/text-enterprise-primary/g, 'text-text-primary');
content = content.replace(/text-enterprise-teal/g, 'text-brand-500');
content = content.replace(/text-enterprise-amber/g, 'text-amber-500');
content = content.replace(/bg-enterprise-teal/g, 'bg-brand-500');
content = content.replace(/border-enterprise-red\/30/g, 'border-red-500/30');

// Replace specific color classes with theme variables
content = content.replace(/bg-blue-500\/10/g, 'bg-brand-500/10');
content = content.replace(/border-blue-500\/20/g, 'border-brand-500/20');
content = content.replace(/text-blue-400/g, 'text-brand-400');
content = content.replace(/text-blue-200\/80/g, 'text-brand-200/80');

fs.writeFileSync(file, content);
console.log('Done AIRecommendations.tsx');
