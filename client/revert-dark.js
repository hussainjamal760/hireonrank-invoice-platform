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

let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  // Revert all specific dark mode classes we added
  newContent = newContent.replace(/ dark:bg-\[\#121212\]/g, '');
  newContent = newContent.replace(/ dark:bg-zinc-900/g, '');
  newContent = newContent.replace(/ dark:border-white/g, '');
  newContent = newContent.replace(/ dark:border-white\/(\d+)/g, '');
  newContent = newContent.replace(/ dark:text-\[\#E5E5E5\]/g, '');
  newContent = newContent.replace(/ dark:text-white\/(\d+)/g, '');
  newContent = newContent.replace(/ dark:bg-\[\#E5E5E5\]/g, '');
  newContent = newContent.replace(/ dark:bg-white\/(\d+)/g, '');
  newContent = newContent.replace(/ dark:text-\[\#121212\]/g, '');
  newContent = newContent.replace(/ dark:text-black\/(\d+)/g, '');
  newContent = newContent.replace(/ dark:shadow-\[(-?\d+px)_(-?\d+px)_0_0_#ffffff\]/g, '');
  newContent = newContent.replace(/ dark:divide-white/g, '');
  newContent = newContent.replace(/ dark:text-white/g, '');
  newContent = newContent.replace(/ dark:bg-white/g, '');
  newContent = newContent.replace(/ dark:text-black/g, '');
  newContent = newContent.replace(/ dark:bg-black/g, '');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedCount++;
  }
});

console.log(`Reverted dark mode classes in ${changedCount} files.`);
