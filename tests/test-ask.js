const fs = require('fs');
const path = require('path');

const CORE_DIR = path.resolve(__dirname, '../core');
const askScript = path.join(CORE_DIR, 'ask_ai.js');
const content = fs.readFileSync(askScript, 'utf8');

console.log('🧪 Test: ask_ai.js path resolution');

console.log('  Script exists:', fs.existsSync(askScript) ? '✅' : '❌');

const hasUpowerRoot = content.includes('UPOWER_ROOT') && content.includes("path.resolve(__dirname, '../..')");
console.log('  Uses UPOWER_ROOT pattern:', hasUpowerRoot ? '✅' : '❌');

const hasNoPromptHack = !content.includes("path.join(__dirname, '../prompts/");
const hasNoKbHack = !content.includes("path.resolve(__dirname, '../../knowledgebase/");
console.log('  No __dirname prompt hack:', hasNoPromptHack ? '✅' : '❌');
console.log('  No __dirname KB hack:', hasNoKbHack ? '✅' : '❌');

const realUpowerRoot = path.resolve(process.env.HOME, '.config/opencode/skills/UPower');
if (fs.existsSync(realUpowerRoot)) {
  const realScriptDir = path.join(realUpowerRoot, 'scaffold/bin');
  const resolvedRoot = path.resolve(realScriptDir, '../..');
  const promptPath = path.join(resolvedRoot, 'scaffold/prompts/step_guide_prompt.md');
  const kbPath = path.join(resolvedRoot, 'knowledgebase/prompt_tag_database');

  console.log(`\n  Live path checks (from ${realScriptDir}):`);
  console.log(`  UPOWER_ROOT resolves to: ${resolvedRoot}`);
  console.log(`  Prompt guide exists: ${fs.existsSync(promptPath) ? '✅' : '❌'}`);
  console.log(`  Knowledge base exists: ${fs.existsSync(kbPath) ? '✅' : '❌'}`);
}

if (hasUpowerRoot && hasNoPromptHack && hasNoKbHack) {
  console.log('\n✅ ALL ASK TESTS PASSED');
} else {
  console.error('\n❌ SOME TESTS FAILED');
  process.exit(1);
}
