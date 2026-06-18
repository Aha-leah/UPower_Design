const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.resolve(__dirname, '../../../Source');
const DEBOUNCE_MS = 1000;

console.log('🤖 Figma Make OS Kernel (Daemon) Starting...');
console.log(`📡 Watching directory: ${SOURCE_DIR}`);

// State Cache to avoid read/write loops
let processingQueue = new Set();
let debounceTimer = null;

// Ensure Source exists
if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
}

// Watcher
fs.watch(SOURCE_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    
    // Ignore system files and the state file itself to prevent loops
    if (filename.includes('.DS_Store') || filename.includes('project_state.json')) return;

    // Extract Project Name
    // filename might be "compshare_new/input/prd.md"
    const parts = filename.split(path.sep);
    if (parts.length < 1) return;
    
    const projectName = parts[0];
    if (!projectName) return;

    // Add to queue
    processingQueue.add(projectName);

    // Debounce processing
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        processQueue();
    }, DEBOUNCE_MS);
});

function processQueue() {
    processingQueue.forEach(projectName => {
        updateProjectState(projectName);
    });
    processingQueue.clear();
}

function updateProjectState(projectName) {
    const projectRoot = path.join(SOURCE_DIR, projectName);
    const stateFile = path.join(projectRoot, 'project_state.json');

    // 1. Check if project root still exists
    if (!fs.existsSync(projectRoot)) return;

    // 2. Read or Initialize State
    let state = {
        projectName: projectName,
        status: 'init',
        lastUpdated: new Date().toISOString(),
        assets: {}
    };

    if (fs.existsSync(stateFile)) {
        try {
            const content = fs.readFileSync(stateFile, 'utf8');
            state = { ...state, ...JSON.parse(content) };
        } catch (e) {
            console.error(`⚠️ Error reading state for ${projectName}, resetting.`);
        }
    }

    // 3. Scan Assets (The Truth)
    const checks = {
        prd: fs.existsSync(path.join(projectRoot, 'input/prd(input).md')),
        brand_dna: fs.existsSync(path.join(projectRoot, 'input/brand_dna.md')),
        style: fs.existsSync(path.join(projectRoot, 'style_prompt.md')),
        specs: fs.existsSync(path.join(projectRoot, 'design_system_specs.md')),
        motion: fs.existsSync(path.join(projectRoot, 'animation_prompts.md')),
        skeleton: fs.existsSync(path.join(projectRoot, 'skeleton_template.json')),
        payload: fs.existsSync(path.join(projectRoot, 'web_content.js')),
        system_prompt: fs.existsSync(path.join(projectRoot, 'system_prompt.md'))
    };

    // 4. Determine Status based on Assets
    let newStatus = 'raw';
    if (checks.prd && checks.brand_dna) newStatus = 'define';
    if (checks.style && checks.specs && checks.motion) newStatus = 'design'; // Partial design check
    if (checks.system_prompt) newStatus = 'assemble';
    
    // Check if built project exists
    const projectBuildPath = path.resolve(__dirname, '../../../projects', projectName);
    if (fs.existsSync(projectBuildPath)) {
        // Preserve advanced states that cannot be inferred from files alone (preview, audit, done)
        if (state.status === 'preview' || state.status === 'audit' || state.status === 'done') {
            newStatus = state.status;
        } else {
            newStatus = 'build';
        }
    }

    // 5. Update State Object
    state.assets = checks;
    state.status = newStatus;
    state.lastUpdated = new Date().toISOString();

    // 6. Write back
    try {
        fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
        console.log(`✅ [${projectName}] State Updated: ${newStatus.toUpperCase()} (PRD:${checks.prd ? 'Y':'N'} | Design:${checks.style ? 'Y':'N'} | Build:${newStatus === 'build' ? 'Y':'N'})`);
    } catch (e) {
        console.error(`❌ Failed to write state for ${projectName}:`, e);
    }
}
