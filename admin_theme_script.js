const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'frontend', 'src', 'pages', 'admin');

const replacements = [
    { from: /text-white/g, to: 'text-slate-900' },
    { from: /text-slate-400/g, to: 'text-slate-500' },
    { from: /bg-slate-800\/60/g, to: 'bg-white' },
    { from: /bg-slate-800/g, to: 'bg-slate-50' },
    { from: /bg-slate-900/g, to: 'bg-white' },
    { from: /border-slate-700/g, to: 'border-slate-200' },
    { from: /hover:bg-slate-700/g, to: 'hover:bg-slate-100' },
    { from: /hover:bg-slate-800/g, to: 'hover:bg-slate-100' },
    { from: /bg-violet-600\/20/g, to: 'bg-slate-100' },
    { from: /bg-violet-600/g, to: 'bg-black text-white' },
    { from: /text-violet-400/g, to: 'text-slate-600' },
    { from: /text-violet-300/g, to: 'text-slate-900' },
    { from: /border-violet-700/g, to: 'border-slate-900' },
    { from: /hover:text-violet-300/g, to: 'hover:text-slate-900' },
    { from: /focus:border-slate-900 dark:border-white/g, to: 'focus:border-slate-900 focus:ring-1 focus:ring-slate-900' },
    { from: /dark:text-white/g, to: '' },
    { from: /dark:bg-slate-9000/g, to: '' },
];

const processFiles = ['AdminRolesPage.jsx', 'AdminSkillsPage.jsx', 'AdminRoadmapConfigPage.jsx'];

for (const file of processFiles) {
    const fullPath = path.join(adminDir, file);
    if (fs.existsSync(fullPath)) {
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
            console.log('Updated', file);
        }
    }
}
