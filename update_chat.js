const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/Chat.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/bg-\[#0B0F19\]/g, 'bg-app-bg');
content = content.replace(/text-\[#F0F4FF\]/g, 'text-text-primary');
content = content.replace(/border-\[#2A3655\]/g, 'border-border-dark');
content = content.replace(/bg-\[#111827\]/g, 'bg-surface-card');
content = content.replace(/bg-\[#00D4FF\]/g, 'bg-brand-500');
content = content.replace(/text-\[#0B0F19\]/g, 'text-app-bg');
content = content.replace(/text-\[#8B9EC4\]/g, 'text-text-secondary');
content = content.replace(/text-\[#4D618A\]/g, 'text-text-muted');
content = content.replace(/bg-\[#1A2236\]/g, 'bg-surface-card');
content = content.replace(/text-\[#00D4FF\]/g, 'text-brand-500');
content = content.replace(/bg-\[#1E2840\]/g, 'bg-surface-layer');
content = content.replace(/bg-\[#3D4F78\]/g, 'bg-border-glow');
content = content.replace(/bg-\[#2A3655\]/g, 'bg-border-dark');
content = content.replace(/ring-\[#00D4FF\]/g, 'ring-brand-500');
content = content.replace(/border-\[#00D4FF\]/g, 'border-brand-500');

fs.writeFileSync(file, content);
console.log('Done');
