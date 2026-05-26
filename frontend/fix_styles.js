import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      // Replace non-standard tailwind color weights
      content = content.replace(/([a-z]+-\w+)-150\b/g, '$1-100');
      content = content.replace(/([a-z]+-\w+)-250\b/g, '$1-200');
      content = content.replace(/([a-z]+-\w+)-350\b/g, '$1-300');
      content = content.replace(/([a-z]+-\w+)-450\b/g, '$1-500');
      content = content.replace(/([a-z]+-\w+)-550\b/g, '$1-500');
      content = content.replace(/([a-z]+-\w+)-650\b/g, '$1-600');
      content = content.replace(/([a-z]+-\w+)-750\b/g, '$1-700');
      content = content.replace(/([a-z]+-\w+)-755\b/g, '$1-700');
      content = content.replace(/([a-z]+-\w+)-850\b/g, '$1-800');

      // Replace template literals with single or double quotes for classNames
      // Wait, let's keep it simple.

      content = content.replace(/className=["']([^"']+)["']/g, (match, classStr) => {
        let classes = classStr.split(/\s+/);
        
        let hasDarkText = classes.some(c => c.startsWith('dark:text-'));
        let hasDarkBg = classes.some(c => c.startsWith('dark:bg-'));

        if (!hasDarkText) {
          if (classes.includes('text-gray-900')) classes.push('dark:text-white');
          else if (classes.includes('text-gray-800')) classes.push('dark:text-gray-100');
          else if (classes.includes('text-gray-700')) classes.push('dark:text-gray-200');
          else if (classes.includes('text-gray-600')) classes.push('dark:text-gray-300');
          else if (classes.includes('text-gray-500')) classes.push('dark:text-gray-400');
          else if (classes.includes('text-black')) classes.push('dark:text-white');
        }

        if (!hasDarkBg) {
          if (classes.includes('bg-white')) classes.push('dark:bg-slate-900');
          else if (classes.includes('bg-gray-50')) classes.push('dark:bg-slate-800');
          else if (classes.includes('bg-gray-100')) classes.push('dark:bg-slate-800');
          else if (classes.includes('bg-gray-200')) classes.push('dark:bg-slate-700');
        }

        return `className="${classes.join(' ')}"`;
      });

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
