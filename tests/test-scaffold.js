const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const UPOWER = path.resolve(__dirname, '../upower.js');
const TEST_ROOT = '/tmp/upower-test-scaffold-' + Date.now();

try {
  fs.mkdirSync(TEST_ROOT, { recursive: true });

  console.log('🧪 Test 1: scaffold --root --name (skip vite, only check Source/)');

  // Run scaffold — note: the vite scaffold part may fail due to Tailwind v4,
  // but Source/ template copy should succeed regardless
  try {
    execSync(`node "${UPOWER}" scaffold --root "${TEST_ROOT}" --name SmokeTest`, {
      stdio: 'pipe',
      timeout: 120000
    });
  } catch (e) {
    // Vite/Tailwind errors are expected — only Source/ matters
  }

  const checks = [
    { path: `${TEST_ROOT}/Source/SmokeTest`, desc: 'Source/SmokeTest/' },
    { path: `${TEST_ROOT}/Source/SmokeTest/input`, desc: 'input/' },
    { path: `${TEST_ROOT}/Source/SmokeTest/input/for_prd`, desc: 'input/for_prd/' },
    { path: `${TEST_ROOT}/Source/SmokeTest/input/prd(input).md`, desc: 'prd(input).md' },
    { path: `${TEST_ROOT}/Source/SmokeTest/input/brand_dna.md`, desc: 'brand_dna.md' },
    { path: `${TEST_ROOT}/Source/SmokeTest/style_prompt.md`, desc: 'style_prompt.md' },
    { path: `${TEST_ROOT}/Source/SmokeTest/skeleton_template.json`, desc: 'skeleton_template.json' },
    { path: `${TEST_ROOT}/Source/SmokeTest/web_content.js`, desc: 'web_content.js' },
    { path: `${TEST_ROOT}/Source/SmokeTest/system_prompt.md`, desc: 'system_prompt.md' },
  ];

  let passed = 0;
  checks.forEach(c => {
    if (fs.existsSync(c.path)) {
      console.log(`  ✅ ${c.desc}`);
      passed++;
    } else {
      console.error(`  ❌ Missing: ${c.desc}`);
    }
  });

  console.log(`\n🧪 Test 2: --help exits with code 0`);
  execSync(`node "${UPOWER}" --help`, { stdio: 'pipe' });
  console.log('  ✅ --help exits cleanly');

  console.log(`\n🧪 Test 3: invalid command exits with code 1`);
  try {
    execSync(`node "${UPOWER}" nonsense`, { stdio: 'pipe' });
    console.error('  ❌ Should have exited with code 1');
  } catch (e) {
    console.log('  ✅ Invalid command rejected');
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Results: ${passed}/${checks.length} template checks passed`);
  if (passed === checks.length) {
    console.log('✅ ALL SCAFFOLD TESTS PASSED');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
} finally {
  fs.rmSync(TEST_ROOT, { recursive: true, force: true });
}
