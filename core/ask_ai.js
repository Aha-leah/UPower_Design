const fs = require('fs');
const path = require('path');

// UPower framework root — from core/ up one level to UPower_v3.4/
const UPOWER_ROOT = path.resolve(__dirname, '..');

// Configuration — paths relative to UPower framework root, not __dirname
const PROMPT_GUIDE_PATH = path.join(UPOWER_ROOT, 'Docs/prompts/step_guide_prompt.md');
const KNOWLEDGE_BASE_PATH = path.join(UPOWER_ROOT, 'Docs/knowledgebase/prompt_tag_database');
const FILE_TEMPLATE_PATH = path.join(UPOWER_ROOT, 'Docs/knowledgebase/file_template');

// Step Configurations mapping CLI keys to Guide Sections and Input Files
const STEPS = {
    'prd': {
        title: '生成设计导向 PRD', // Partial match for section title
        inputs: [
            { type: 'dir', path: 'input/for_prd' }
        ],
        includeKnowledgeBase: false,
        templateFile: 'kb_prd_template.md'
    },
    'dna': {
        title: '生成品牌 DNA',
        inputs: [
            { type: 'file', path: 'input/prd(input).md' }
        ],
        includeKnowledgeBase: true
    },
    'skeleton': {
        title: '生成页面骨架',
        inputs: [
            { type: 'file', path: 'input/prd(input).md' }
        ],
        includeKnowledgeBase: false
    },
    'payload': {
        title: '生成真实内容载荷',
        inputs: [
            { type: 'file', path: 'input/prd(input).md' },
            { type: 'file', path: 'skeleton_template.json' }
        ],
        includeKnowledgeBase: false
    },
    'motion': {
        title: '生成动画指南',
        inputs: [
            { type: 'file', path: 'input/brand_dna.md' }
        ],
        includeKnowledgeBase: true
    },
    'style': {
        title: '生成绘图提示词',
        inputs: [
            { type: 'file', path: 'input/brand_dna.md' }
        ],
        includeKnowledgeBase: true
    },
    'specs': {
        title: '生成设计规范',
        inputs: [
            { type: 'file', path: 'input/brand_dna.md' }
        ],
        includeKnowledgeBase: true
    }
};

function readKnowledgeBase() {
    let kbContent = "";
    if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
        const files = fs.readdirSync(KNOWLEDGE_BASE_PATH);
        files.forEach(file => {
            if (path.extname(file) === '.md') {
                const fullPath = path.join(KNOWLEDGE_BASE_PATH, file);
                const content = fs.readFileSync(fullPath, 'utf8');
                kbContent += `\n\n=== KNOWLEDGE BASE: ${file} ===\n${content}\n`;
            }
        });
    }
    return kbContent;
}

function readTemplateFile(templateFileName) {
    if (!templateFileName) return "";
    const templatePath = path.join(FILE_TEMPLATE_PATH, templateFileName);
    if (fs.existsSync(templatePath)) {
        const content = fs.readFileSync(templatePath, 'utf8');
        return `\n\n=== TEMPLATE REFERENCE: ${templateFileName} ===\n${content}\n`;
    }
    console.warn(`⚠️ Warning: Template file not found: ${templateFileName}`);
    return "";
}

function extractPromptFromGuide(guideContent, stepTitle) {
    // Regex to find the section and then the code block within it
    // 1. Find the header (e.g. "### 1. 生成设计导向 PRD")
    // 2. Look for "**Prompt**:" or similar
    // 3. Capture the code block content
    
    // Construct regex safely escaping the title
    // Matches: ### [Number]. [Title] ... until next ###
    const sectionRegex = new RegExp(`###\\s*\\d+\\.\\s*${stepTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=###|$)`, 'i');
    const sectionMatch = guideContent.match(sectionRegex);
    
    if (!sectionMatch) return null;
    
    const sectionContent = sectionMatch[0];
    
    // Extract code block after "**Prompt**"
    const promptBlockRegex = /\*\*Prompt\*\*[\s\S]*?```markdown\n([\s\S]*?)```/i;
    const promptMatch = sectionContent.match(promptBlockRegex);
    
    if (promptMatch && promptMatch[1]) {
        return promptMatch[1].trim();
    }
    
    return null;
}

function readInputFiles(projectPath, inputConfigs) {
    let context = "";
    
    for (const config of inputConfigs) {
        const fullPath = path.join(projectPath, config.path);
        
        if (config.type === 'file') {
            try {
                if (fs.existsSync(fullPath)) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    context += `\n\n=== FILE: ${config.path} ===\n${content}\n`;
                } else {
                    context += `\n\n=== FILE: ${config.path} (MISSING) ===\n`;
                    console.warn(`⚠️ Warning: Input file not found: ${config.path}`);
                }
            } catch (err) {
                console.error(`❌ Error reading file ${config.path}: ${err.message}`);
            }
        } else if (config.type === 'dir') {
            try {
                if (fs.existsSync(fullPath)) {
                    const files = fs.readdirSync(fullPath);
                    if (files.length === 0) {
                        context += `\n\n=== DIR: ${config.path} (EMPTY) ===\n`;
                    }
                    for (const file of files) {
                        if (file.startsWith('.')) continue; // Skip hidden files
                        const filePath = path.join(fullPath, file);
                        const stat = fs.statSync(filePath);
                        if (stat.isFile()) {
                            const content = fs.readFileSync(filePath, 'utf8');
                            context += `\n\n=== FILE: ${path.join(config.path, file)} ===\n${content}\n`;
                        }
                    }
                } else {
                    context += `\n\n=== DIR: ${config.path} (MISSING) ===\n`;
                    console.warn(`⚠️ Warning: Input directory not found: ${config.path}`);
                }
            } catch (err) {
                console.error(`❌ Error reading directory ${config.path}: ${err.message}`);
            }
        }
    }
    return context;
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: node ask_ai.js <step_key> <project_path>');
        console.error('Available steps:', Object.keys(STEPS).join(', '));
        process.exit(1);
    }

    const stepKey = args[0];
    const projectPath = path.resolve(process.cwd(), args[1]);
    
    if (!STEPS[stepKey]) {
        console.error(`❌ Invalid step key: ${stepKey}`);
        console.error('Available steps:', Object.keys(STEPS).join(', '));
        process.exit(1);
    }

    console.log(`🚀 Preparing Prompt for Step: ${stepKey} (${STEPS[stepKey].title})...`);

    // 1. Read Prompt Guide
    let guideContent;
    try {
        guideContent = fs.readFileSync(PROMPT_GUIDE_PATH, 'utf8');
    } catch (err) {
        console.error(`❌ Error reading prompt guide at ${PROMPT_GUIDE_PATH}: ${err.message}`);
        process.exit(1);
    }

    // 2. Extract Template
    const promptTemplate = extractPromptFromGuide(guideContent, STEPS[stepKey].title);
    if (!promptTemplate) {
        console.error(`❌ Could not find prompt template for "${STEPS[stepKey].title}" in guide.`);
        process.exit(1);
    }

    // 3. Read Context
    let contextContent = readInputFiles(projectPath, STEPS[stepKey].inputs);

    // 3.1. Inject Knowledge Base if configured
    if (STEPS[stepKey].includeKnowledgeBase) {
        console.log(`📚 Injecting Knowledge Base content...`);
        contextContent += readKnowledgeBase();
    }

    if (STEPS[stepKey].templateFile) {
        console.log(`📋 Injecting Template: ${STEPS[stepKey].templateFile}...`);
        contextContent += readTemplateFile(STEPS[stepKey].templateFile);
    }

    // 4. Assemble Final Prompt
    const finalOutput = `
${promptTemplate}

---
# PROJECT CONTEXT INPUTS
The following are the input files for this task:

${contextContent}
`;

    // 5. Output
    // Write to a file for easy copying
    const outputPromptPath = path.join(projectPath, `prompt_for_${stepKey}.md`);
    try {
        fs.writeFileSync(outputPromptPath, finalOutput, 'utf8');
        console.log(`\n✅ Prompt generated successfully!`);
        console.log(`📂 Saved to: ${outputPromptPath}`);
        console.log(`👉 You can now copy the content of this file and paste it to your AI assistant.`);
    } catch (err) {
        console.error(`❌ Error writing output file: ${err.message}`);
    }
}

main();
