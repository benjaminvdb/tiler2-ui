#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all TypeScript/JavaScript files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Extract imports from a file
function extractImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Match various import patterns
    const patterns = [
      // Standard imports: import ... from "path"
      /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g,
      // Dynamic imports: import("path")
      /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      // Re-exports: export ... from "path"
      /export\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g,
    ];
    
    patterns.forEach(regex => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const importPath = match[1];
        // Only consider relative imports
        if (importPath.startsWith('.')) {
          imports.push(importPath);
        }
      }
    });
    
    return imports;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

// Resolve import path to actual file
function resolveImportPath(importPath, fromFile) {
  const fromDir = path.dirname(fromFile);
  let resolvedPath = path.resolve(fromDir, importPath);
  
  // Try different extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  // If it's a directory, look for index file
  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
    for (const ext of extensions) {
      const indexPath = path.join(resolvedPath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
  }
  
  // Try adding extensions
  for (const ext of extensions) {
    const pathWithExt = resolvedPath + ext;
    if (fs.existsSync(pathWithExt)) {
      return pathWithExt;
    }
  }
  
  return null;
}

const srcDir = path.join(__dirname, 'src');
const allFiles = getAllFiles(srcDir);
const importedFiles = new Set();

// Find all imported files
allFiles.forEach(file => {
  const imports = extractImports(file);
  imports.forEach(importPath => {
    const resolvedPath = resolveImportPath(importPath, file);
    if (resolvedPath) {
      importedFiles.add(resolvedPath);
    }
  });
});

// Find unused files
const unusedFiles = allFiles.filter(file => {
  // Skip entry points
  if (file.includes('/app/page.tsx') || 
      file.includes('/app/layout.tsx') || 
      file.includes('/middleware.ts') ||
      file.includes('/app/api/')) {
    return false;
  }
  
  return !importedFiles.has(file);
});

console.log('Potentially unused files:');
unusedFiles.forEach(file => {
  console.log(file.replace(__dirname + '/', ''));
});

console.log(`\nTotal files: ${allFiles.length}`);
console.log(`Imported files: ${importedFiles.size}`);
console.log(`Potentially unused: ${unusedFiles.length}`);