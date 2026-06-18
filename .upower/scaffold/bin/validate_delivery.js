const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Usage: node validate_delivery.js <project_path>
// Example: node validate_delivery.js projects/compshare_new

const projectRelPath = process.argv[2];
if (!projectRelPath) {
    console.error('❌ Usage: node validate_delivery.js <project_path>');
    process.exit(1);
}

const rootDir = path.resolve(__dirname, '../../../');
const projectPath = path.resolve(rootDir, projectRelPath);
const projectName = path.basename(projectPath);
const sourcePath = path.join(rootDir, 'Source', projectName);

console.log(`🔍 Starting Pre-Audit Self-Check for: ${projectName}`);
console.log(`   Project Path: ${projectPath}`);
console.log(`   Source Path:  ${sourcePath}`);

let hasErrors = false;

// 1. Check Data Link Integrity (The "Tier 3" Link)
console.log('\n🔗 1. Checking Data Link Integrity...');
const linkedContentPath = path.join(projectPath, 'src/data/source_content.js');
const targetSourceContent = path.join(sourcePath, 'web_content.js');

if (!fs.existsSync(linkedContentPath)) {
    console.error(`❌ Missing Data Link: ${linkedContentPath} does not exist.`);
    console.error(`   Expected symlink to: ${targetSourceContent}`);
    hasErrors = true;
} else {
    // Check if it's actually linked or at least identical
    try {
        const stats = fs.lstatSync(linkedContentPath);
        if (stats.isSymbolicLink()) {
            console.log('✅ Data Link is active (Symlink detected).');
        } else {
            console.warn('⚠️  Data Link is a physical copy, not a symlink. Drift is possible.');
            // Optional: Compare content
            const projectContent = fs.readFileSync(linkedContentPath, 'utf8');
            const sourceContent = fs.readFileSync(targetSourceContent, 'utf8');
            if (projectContent === sourceContent) {
                console.log('✅ Content matches Source exactly.');
            } else {
                console.error('❌ Content DRIFT detected! Project data != Source data.');
                hasErrors = true;
            }
        }
    } catch (e) {
        console.error(`❌ Error checking link: ${e.message}`);
        hasErrors = true;
    }
}

// 2. Check TypeScript Compilation (Type Safety)
console.log('\n🛡️  2. Verifying Type Safety (Build Check)...');
try {
    // Use stdio: 'pipe' to capture output, but we want to show it on error
    execSync('npm run build', { cwd: projectPath, stdio: 'inherit' });
    console.log('✅ Build PASSED. Types are safe.');
} catch (e) {
    console.error('❌ Build FAILED. Type mismatches detected.');
    console.error('   This usually means `content.ts` interface does not match `web_content.js` data.');
    hasErrors = true;
}

// 3. Check System Prompt Alignment
console.log('\n📋 3. Verifying System Prompt Alignment...');
const projectPromptPath = path.join(projectPath, 'system_prompt.md');
const sourcePromptPath = path.join(sourcePath, 'system_prompt.md');

if (!fs.existsSync(projectPromptPath)) {
    console.error('❌ Missing Project System Prompt.');
    hasErrors = true;
} else if (!fs.existsSync(sourcePromptPath)) {
    console.error('❌ Missing Source System Prompt.');
    hasErrors = true;
} else {
    const projectPrompt = fs.readFileSync(projectPromptPath, 'utf8');
    const sourcePrompt = fs.readFileSync(sourcePromptPath, 'utf8');
    if (projectPrompt === sourcePrompt) {
        console.log('✅ System Prompt aligned.');
    } else {
        console.warn('⚠️  System Prompt mismatch. Project may be running on outdated instructions.');
        console.warn('   Action: Run `cp Source/.../system_prompt.md projects/.../` to re-align.');
        // This might not be a hard fail, but it's a warning
    }
}

// Final Report
console.log('\n----------------------------------------');
if (hasErrors) {
    console.error('🛑 SELF-CHECK FAILED. Do not submit for audit.');
    console.error('   Fix the errors above and re-run.');
    process.exit(1);
} else {
    console.log('✅ SELF-CHECK PASSED. Ready for Audit.');
    process.exit(0);
}
