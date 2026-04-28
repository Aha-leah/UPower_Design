const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- OpenCode-compatible arg parsing ---
// Supports: node scaffold_project.js --root <path> --name <name>
// Legacy:   node scaffold_project.js <project_name>
function parseArgs(argv) {
  const args = { root: null, name: null, upowerRoot: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--root') { args.root = argv[++i]; continue; }
    if (argv[i] === '--name') { args.name = argv[++i]; continue; }
    if (argv[i] === '--upower-root') { args.upowerRoot = argv[++i]; continue; }
    if (!argv[i].startsWith('--') && !args.name) args.name = argv[i];
  }
  return args;
}

const parsedArgs = parseArgs(process.argv);
const projectName = parsedArgs.name;

// Root resolution priority: --root > UPOWER_ROOT env > cwd
const rootDir = path.resolve(parsedArgs.root || process.env.UPOWER_ROOT || process.cwd());

if (!projectName) {
  console.error('❌ Please provide a project name.');
  console.error('Usage: node scaffold_project.js --root <project_root> --name <project_name>');
  console.error('       node scaffold_project.js <project_name>  (legacy, uses cwd as root)');
  process.exit(1);
}

// UPower framework root: --upower-root > UPOWER_ROOT env > __dirname/../../ (Trae) > __dirname/.. (v3.4 package)
function findUpowerRoot() {
  if (parsedArgs.upowerRoot) return path.resolve(parsedArgs.upowerRoot);
  if (process.env.UPOWER_ROOT) return path.resolve(process.env.UPOWER_ROOT);
  const traeRoot = path.resolve(__dirname, '../..');
  if (fs.existsSync(path.join(traeRoot, 'scaffold/templates'))) return traeRoot;
  const pkgRoot = path.resolve(__dirname, '..');
  if (fs.existsSync(path.join(pkgRoot, 'Docs/templates'))) return pkgRoot;
  return traeRoot;
}
const upowerRoot = findUpowerRoot();

const sourceDir = path.join(rootDir, 'Source', projectName);
const projectsDir = path.join(rootDir, 'projects');
const targetDir = path.join(projectsDir, projectName);

// 1. Validate Source Exists
if (!fs.existsSync(sourceDir)) {
  console.log(`ℹ️  Source directory not found. Creating: ${sourceDir}`);
  fs.mkdirSync(sourceDir, { recursive: true });

  // Copy Template Files — try scaffold/ path first, then Docs/ (v3.4 package)
  let templateDir = path.join(upowerRoot, 'scaffold/templates/Object_Name');
  if (!fs.existsSync(templateDir)) {
    templateDir = path.join(upowerRoot, 'Docs/templates/Object_Name');
  }

  if (fs.existsSync(templateDir)) {
    try {
      fs.cpSync(templateDir, sourceDir, { recursive: true });
      console.log('   ✅ Initialized Source with Template');
    } catch (err) {
      console.error('   ❌ Failed to copy template:', err);
    }
  } else {
    fs.mkdirSync(path.join(sourceDir, 'input'), { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'project_state.json'), JSON.stringify({ status: "raw", created: new Date() }, null, 2));
    console.log('   ✅ Initialized empty Source structure');
  }
}

// 2. Ensure projects/ folder exists
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
}

// 3. Create Vite Project if it doesn't exist
if (!fs.existsSync(targetDir)) {
  console.log(`🚀 Scaffolding new project: ${projectName}...`);
  try {
    // Run npm create vite (non-interactive mode for CI/IDE compatibility)
    execSync(`npm create vite@latest ${projectName} -- --template react-ts --no-interactive`, {
      cwd: projectsDir,
      stdio: 'inherit'
    });
    
    // Install dependencies (optional, but good for UX)
    console.log('📦 Installing dependencies...');
    execSync('npm install', {
      cwd: targetDir,
      stdio: 'inherit'
    });
    
    // Install standard UI libs
    console.log('🎨 Installing UI libraries (lucide-react, framer-motion, clsx, tailwind-merge)...');
    execSync('npm install lucide-react framer-motion clsx tailwind-merge', {
      cwd: targetDir,
      stdio: 'inherit'
    });

    // Install Tailwind v3 (v4 has CLI compatibility issues, stick to v3 for stability)
    console.log('🌬️ Initializing Tailwind CSS v3...');
    execSync('npm install -D tailwindcss@3 postcss autoprefixer', { cwd: targetDir, stdio: 'inherit' });
    execSync('npx tailwindcss init -p', { cwd: targetDir, stdio: 'inherit' });
    
    // Fix Tailwind config: set content paths for Vite React TS
    const tailwindConfigPath = path.join(targetDir, 'tailwind.config.js');
    if (fs.existsSync(tailwindConfigPath)) {
      let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');
      // Replace empty content array with proper paths
      tailwindConfig = tailwindConfig.replace(
        /content:\s*\[\s*\]/,
        'content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]'
      );
      fs.writeFileSync(tailwindConfigPath, tailwindConfig);
      console.log('   ✅ Fixed Tailwind content configuration');
    }

  } catch (error) {
    console.error('❌ Failed to create project:', error);
    process.exit(1);
  }
} else {
  console.log(`ℹ️  Project directory already exists: ${targetDir}`);
}

// 5. Inject Assets
console.log('💉 Injecting Figma Make assets...');

// 5.1 System Prompt (Copy)
const promptSrc = path.join(sourceDir, 'system_prompt.md');
const promptDest = path.join(targetDir, 'system_prompt.md');
if (fs.existsSync(promptSrc)) {
  fs.copyFileSync(promptSrc, promptDest);
  console.log('   ✅ Copied: system_prompt.md');
} else {
  console.warn('   ⚠️  Missing source: system_prompt.md');
}

// 5.2 Data Link (Symlink - Tier 3 Strategy)
const dataDir = path.join(targetDir, 'src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const contentSrc = path.join(sourceDir, 'web_content.js');
const contentLink = path.join(dataDir, 'source_content.js'); // Renamed to imply it's raw source
// Relative path from src/data to Source/Project
// targetDir/src/data -> targetDir -> projectsDir -> root -> Source -> Project -> file
const relPath = path.relative(dataDir, contentSrc);

if (fs.existsSync(contentSrc)) {
  try {
    if (fs.existsSync(contentLink)) fs.unlinkSync(contentLink); // Remove existing
    fs.symlinkSync(relPath, contentLink);
    console.log('   🔗 Linked: src/data/source_content.js -> Source (Live Link)');
  } catch (e) {
    console.error('   ❌ Failed to link data:', e.message);
    // Fallback to copy if symlink fails
    fs.copyFileSync(contentSrc, contentLink);
    console.log('   ⚠️  Fallback: Copied file instead of link.');
  }
} else {
  console.warn('   ⚠️  Missing source: web_content.js');
}

// 5.3 Generate content.ts wrapper
const contentTsPath = path.join(dataDir, 'content.ts');
if (!fs.existsSync(contentTsPath)) {
  const tsContent = `// Generated Content Wrapper
// This file imports the live data from Source and types it.
// DO NOT EDIT THE DATA HERE. Edit Source/[Name]/web_content.js instead.

// @ts-ignore
import { content as rawContent } from './source_content';

export type WebContent = typeof rawContent;
export const content: WebContent = rawContent;
`;
  fs.writeFileSync(contentTsPath, tsContent);
  console.log('   ✅ Generated: src/data/content.ts (Wrapper)');
}

// 5. Create Image Directory
const imageDir = path.join(targetDir, 'src/assets/images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
  console.log('   ✅ Created: src/assets/images/');
}

console.log(`
🎉 Project Scaffolding Complete!
----------------------------------------
👉 Next Steps:
1. cd projects/${projectName}
2. Open in IDE
3. Drag "system_prompt.md" to Trae/Cursor Chat
4. "Start Coding!"
`);
