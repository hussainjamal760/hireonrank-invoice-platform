const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app');

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walk(dir);

const replacements = [
  { regex: /(?<!dark:)bg-white/g, replacement: 'bg-white dark:bg-[#121212]' },
  { regex: /(?<!dark:)bg-\[\#fbfbfa\]/g, replacement: 'bg-[#fbfbfa] dark:bg-zinc-900' },
  { regex: /(?<!dark:)border-black(?![\w\-\/])/g, replacement: 'border-black dark:border-white' },
  { regex: /(?<!dark:)border-black\/(\d+)/g, replacement: 'border-black/$1 dark:border-white/$1' },
  { regex: /(?<!dark:)text-black(?![\w\-\/])/g, replacement: 'text-black dark:text-[#E5E5E5]' },
  { regex: /(?<!dark:)text-black\/(\d+)/g, replacement: 'text-black/$1 dark:text-white/$1' },
  { regex: /(?<!dark:)bg-black(?![\w\-\/])/g, replacement: 'bg-black dark:bg-[#E5E5E5]' },
  { regex: /(?<!dark:)bg-black\/(\d+)/g, replacement: 'bg-black/$1 dark:bg-white/$1' },
  { regex: /(?<!dark:)text-white(?![\w\-\/])/g, replacement: 'text-white dark:text-[#121212]' },
  { regex: /(?<!dark:)text-white\/(\d+)/g, replacement: 'text-white/$1 dark:text-black/$1' },
  { regex: /(?<!dark:)shadow-\[(-?\d+px)_(-?\d+px)_0_0_#000000\]/g, replacement: 'shadow-[$1_$2_0_0_#000000] dark:shadow-[$1_$2_0_0_#ffffff]' },
  { regex: /(?<!dark:)divide-black(?![\w\-\/])/g, replacement: 'divide-black dark:divide-white' },
];

let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  replacements.forEach(r => {
    newContent = newContent.replace(r.regex, r.replacement);
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedCount++;
  }
});

console.log(`Updated ${changedCount} files with dark mode classes.`);
