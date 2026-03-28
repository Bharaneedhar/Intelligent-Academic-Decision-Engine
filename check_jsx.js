const fs = require('fs');
const parser = require('@babel/parser');
try {
  const code = fs.readFileSync('frontend/src/pages/DashboardPage.jsx', 'utf8');
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log("Syntax OK!");
} catch (e) {
  console.error("Error at line", e.loc?.line, "col", e.loc?.column, "-", e.message);
}
