const fs = require('fs');
const path = require('path');

const layouts = [
  path.join(__dirname, 'src', 'app', 'admin-dashboard', 'layout.tsx'),
  path.join(__dirname, 'src', 'app', 'accountant-dashboard', 'layout.tsx'),
  path.join(__dirname, 'src', 'app', 'employee-dashboard', 'layout.tsx')
];

layouts.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Extract aside block and fix it
    const asideMatch = content.match(/<aside[\s\S]*?<\/aside>/);
    if (asideMatch) {
      let aside = asideMatch[0];
      
      // Revert dark mode modifications inside aside
      aside = aside.replace(/ dark:text-\[\#121212\]/g, '');
      aside = aside.replace(/ dark:text-black\/(\d+)/g, '');
      aside = aside.replace(/ dark:bg-\[\#121212\]/g, '');
      aside = aside.replace(/ dark:text-\[\#E5E5E5\]/g, '');
      aside = aside.replace(/ dark:bg-white\/(\d+)/g, '');
      
      content = content.replace(asideMatch[0], aside);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Fixed sidebar in ${file}`);
    }
  }
});
