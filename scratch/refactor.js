import fs from 'fs';
import path from 'path';

const appsDir = 'd:/Projects/Flodon-Internal/Flodon-Internal/apps';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(appsDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const importRegex = /import\s+\{(.*?)\}\s+from\s+['"]\.\.?\/(?:utils\/|supabase\.js|config\.js).*?['"]/g;
    
    let matches;
    let symbols = new Set();
    let linesToRemove = [];

    while ((matches = importRegex.exec(content)) !== null) {
        matches[1].split(',').forEach(s => symbols.add(s.trim()));
        linesToRemove.push(matches[0]);
    }

    if (symbols.size > 0) {
        console.log(`Refactoring ${file}...`);
        // Remove old imports
        linesToRemove.forEach(line => {
            content = content.replace(line, '');
        });

        // Add new combined import
        const newImport = `import { ${Array.from(symbols).join(', ')} } from '@flodon/core'`;
        
        // Insert at the top after other imports or at line 2
        content = newImport + '\n' + content.trim();
        
        fs.writeFileSync(file, content);
    }
});
