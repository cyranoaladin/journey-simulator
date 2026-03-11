#!/usr/bin/env node
/**
 * Copy .js files from src to dist preserving directory structure
 * Required because orchestration and agent files are in JavaScript
 */

const fs = require('fs');
const path = require('path');

function copyJsFiles(src, dest) {
  if (!fs.existsSync(src)) return;
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyJsFiles(srcPath, destPath);
    } else if (entry.name.endsWith('.js')) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('📦 Copying .js files from src to dist...');
copyJsFiles(srcDir, distDir);
console.log('✓ JavaScript files copied successfully');
