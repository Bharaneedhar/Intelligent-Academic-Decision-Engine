const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');

const replacements = [
    { from: /bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50/g, to: 'bg-slate-50 dark:bg-[#030712]' },
    { from: /bg-gradient-to-r from-violet-600 to-indigo-600/g, to: 'bg-black dark:bg-white' },
    { from: /bg-gradient-to-r from-slate-900 to-violet-700/g, to: 'bg-black dark:bg-white' },
    { from: /text-violet-600/g, to: 'text-slate-900 dark:text-white' },
    { from: /text-violet-700/g, to: 'text-slate-900 dark:text-white' },
    { from: /text-violet-500/g, to: 'text-slate-900 dark:text-white' },
    { from: /bg-violet-100/g, to: 'bg-slate-200 dark:bg-slate-800' },
    { from: /bg-violet-50/g, to: 'bg-slate-100 dark:bg-slate-900' },
    { from: /border-violet-500/g, to: 'border-slate-900 dark:border-white' },
    { from: /border-violet-400/g, to: 'border-slate-800 dark:border-slate-200' },
    { from: /border-violet-300/g, to: 'border-slate-300 dark:border-slate-600' },
    { from: /border-violet-100/g, to: 'border-slate-200 dark:border-slate-800' },
    { from: /ring-violet-400/g, to: 'ring-slate-900 dark:ring-white' },
    { from: /ring-violet-200/g, to: 'ring-slate-200 dark:ring-slate-700' },
    { from: /ring-violet-100/g, to: 'ring-slate-100 dark:ring-slate-800' },
    { from: /ring-violet-500/g, to: 'ring-slate-900 dark:ring-white' },
    { from: /shadow-violet-500\/20/g, to: 'shadow-slate-500/10' },
    { from: /shadow-violet-500\/40/g, to: 'shadow-slate-500/20' },
    // A couple extra dashboard ones
    { from: /bg-primary\/5/g, to: 'bg-slate-100 dark:bg-slate-800' },
    { from: /bg-primary\/10/g, to: 'bg-slate-200 dark:bg-slate-700' },
    { from: /text-primary/g, to: 'text-slate-900 dark:text-white' },
    { from: /bg-primary text-white/g, to: 'bg-black text-white dark:bg-white dark:text-black' },
    { from: /bg-primary/g, to: 'bg-black dark:bg-white' },
    { from: /shadow-primary\/20/g, to: 'shadow-slate-500/10' },
    { from: /ring-primary\/30/g, to: 'ring-slate-300 dark:ring-slate-600' },
    { from: /ring-primary/g, to: 'ring-slate-900 dark:ring-white' },
    { from: /border-primary\/20/g, to: 'border-slate-200 dark:border-slate-700' },
    { from: /border-primary/g, to: 'border-slate-900 dark:border-white' },
    { from: /hover:text-primary/g, to: 'hover:text-black dark:hover:text-white' },
    { from: /group-hover:text-primary/g, to: 'group-hover:text-black dark:group-hover:text-white' },
];

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            for (const r of replacements) {
                if (r.from.test(content)) {
                    content = content.replace(r.from, r.to);
                    modified = true;
                }
            }
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated', fullPath);
            }
        }
    }
}

processDir(pagesDir);
