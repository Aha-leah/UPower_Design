const fs = require('fs');
const path = require('path');

const UPOWER_ROOT = path.resolve(__dirname, '../core');
const scriptPath = path.join(UPOWER_ROOT, 'assemble_system_prompt.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

console.log('🧪 Test: assemble_system_prompt.js path resolution');

console.log('  Checking script exists:', fs.existsSync(scriptPath) ? '✅' : '❌');

const hasUpowerRoot = scriptContent.includes('UPOWER_ROOT') && scriptContent.includes("path.resolve(__dirname, '../..')");
console.log('  Uses UPOWER_ROOT pattern:', hasUpowerRoot ? '✅' : '❌');

const hasNoTemplateHack = !scriptContent.includes("path.join(__dirname, 'system_prompt_template.md')");
console.log('  No __dirname template hack:', hasNoTemplateHack ? '✅' : '❌');

// Verify from real install location
const realUpowerRoot = path.resolve(process.env.HOME, '.config/opencode/skills/UPower');
if (fs.existsSync(realUpowerRoot)) {
  const realScriptDir = path.join(realUpowerRoot, 'scaffold/bin');
  const resolvedRoot = path.resolve(realScriptDir, '../..');
  const templatePath = path.join(resolvedRoot, 'scaffold/bin/system_prompt_template.md');

  console.log(`\n  Live path checks (from ${realScriptDir}):`);
  console.log(`  UPOWER_ROOT resolves to: ${resolvedRoot}`);
  console.log(`  Template exists: ${fs.existsSync(templatePath) ? '✅' : '❌'}`);
}

if (hasUpowerRoot && hasNoTemplateHack) {
  console.log('\n✅ ALL ASSEMBLE TESTS PASSED');
} else {
  console.error('\n❌ SOME TESTS FAILED');
  process.exit(1);
}
