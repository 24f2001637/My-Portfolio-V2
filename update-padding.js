const fs = require('fs');
const path = require('path');

const dir = './src/pages';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace px-12 with px-6 md:px-12 on root div classes where max-w-7xl is present, etc.
    content = content.replace(/px-12/g, 'px-6 md:px-12');
    
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
  }
});
