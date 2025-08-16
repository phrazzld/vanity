#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const readingsDir = path.join(process.cwd(), 'content/readings');
const files = fs.readdirSync(readingsDir);

files.forEach(file => {
  const filePath = path.join(readingsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix fields that contain colons or special characters
  content = content.replace(/^(title|author): (.+)$/gm, (match, field, value) => {
    // If the value contains special characters and isn't already quoted
    if ((value.includes(':') || value.includes('"') || value.includes('@')) && !value.startsWith("'") && !value.startsWith('"')) {
      return `${field}: '${value.replace(/'/g, "''")}'`;
    }
    return match;
  });
  
  fs.writeFileSync(filePath, content);
});

console.log('Fixed YAML in all reading files');