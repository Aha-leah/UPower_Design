const fs = require('fs');
const path = require('path');

// UPower framework root — always the skill dir (IDE-agnostic)
const UPOWER_ROOT = path.resolve(__dirname, '../..');

// Configuration — template path relative to UPower framework root
const TEMPLATE_PATH = path.join(UPOWER_ROOT, 'scaffold/bin/system_prompt_template.md');

// Placeholder Mappings
// Maps placeholder keys to { filename, regex_extractor (optional) }
// If regex is null, it extracts the whole file content or specific sections based on heuristic
const MAPPINGS = {
    '{{STYLE_NAME}}': { 
        file: 'style_prompt.md', 
        regex: /# Style Prompt:\s*(.*)/i 
    },
    '{{INSERT_CORE_PHILOSOPHY}}': {
        file: 'style_prompt.md',
        regex: /(?:## Part 1: The Design Philosophy|### Core Essence|\*\*Core Essence)[\s\S]*?(?=## Part 2|###|$)/i
    },
    '{{INSERT_VISUAL_DNA}}': {
        file: 'style_prompt.md',
        regex: /(?:### Visual DNA|\*\*Visual DNA)[\s\S]*?(?=###|\*\*The "Bold Factor"|$)/i
    },
    '{{INSERT_SENSORY_DESCRIPTION}}': {
        file: 'style_prompt.md',
        regex: /(?:### Sensory Description|### Sensory Descriptions|\*\*Sensory Description)[\s\S]*?(?=##|$)/i
    },
    '{{INSERT_COLOR_PALETTE}}': {
        file: 'design_system_specs.md',
        regex: /(?:## \d+\. Color System|### Colors|### Color Palette)[\s\S]*?(?=## \d+\.|###|$)/i
    },
    '{{INSERT_TYPOGRAPHY_SYSTEM}}': {
        file: 'design_system_specs.md',
        regex: /(?:## \d+\. Typography System|### Typography|### Typography System)[\s\S]*?(?=## \d+\.|###|$)/i
    },
    '{{INSERT_SHAPE_SYSTEM}}': {
        file: 'design_system_specs.md',
        regex: /(?:### Radius Strategy|### Radius|### Shapes)[\s\S]*?(?=###|$)/i
    },
    '{{INSERT_EFFECTS_SYSTEM}}': {
        file: 'design_system_specs.md',
        regex: /(?:### Shadows|### Effects)[\s\S]*?(?=##|$)/i
    },
    '{{INSERT_LAYOUT_SYSTEM}}': {
        file: 'design_system_specs.md',
        regex: /(?:## \d+\. Layout & Spacing|### Layout|### Spacing & Layout)[\s\S]*?(?=##|$)/i
    },
    '{{INSERT_BUTTON_STYLES}}': {
        file: 'design_system_specs.md',
        regex: /(?:### Buttons)[\s\S]*?(?=###|$)/i
    },
    '{{INSERT_CARD_STYLES}}': {
        file: 'design_system_specs.md',
        regex: /(?:### Cards)[\s\S]*?(?=###|$)/i
    },
    '{{INSERT_INPUT_STYLES}}': {
        file: 'design_system_specs.md',
        regex: /(?:### Inputs)[\s\S]*?(?=###|##|$)/i
    },
    '{{INSERT_BOLD_FACTORS}}': {
        file: 'style_prompt.md', 
        regex: /(?:## \d+\. The "Bold Factor"|## The "Bold Factor"|\*\*The "Bold Factor")[\s\S]*?(?=##|$)/i
    },
    '{{INSERT_MOTION_PHILOSOPHY}}': {
        file: 'animation_prompts.md',
        regex: /(?:## \d+\. Motion Philosophy|### Motion Philosophy|## \d+\. General Philosophy)[\s\S]*?(?=##|$)/i
    },
    '{{INSERT_INTERACTION_PATTERNS}}': {
        file: 'animation_prompts.md',
        regex: /(?:## \d+\. Choreography|### Choreography|## \d+\. Specific Interactions|### Interaction Patterns)[\s\S]*?(?=##|$)/i
    },
    '{{INSERT_RESPONSIVE_RULES}}': {
        file: 'design_system_specs.md',
        regex: /(?:## \d+\. Responsive Strategy|## Responsive Strategy)[\s\S]*?(?=##|$)/i
    },
    '{{INSERT_ANTI_PATTERNS}}': {
        file: 'design_system_specs.md',
        regex: /(?:## \d+\. Anti-Patterns|## Anti-Patterns)[\s\S]*?(?=##|$)/i
    }
};

async function assemblePrompt(projectPath) {
    console.log(`🚀 Starting System Prompt Assembly for: ${projectPath}`);

    // 1. Read Template
    let templateContent;
    try {
        templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');
        console.log(`✅ Loaded template from: ${TEMPLATE_PATH}`);
    } catch (err) {
        console.error(`❌ Error reading template: ${err.message}`);
        process.exit(1);
    }

    // 2. Read Source Files
    const sourceFiles = {
        'style_prompt.md': null,
        'design_system_specs.md': null,
        'animation_prompts.md': null
    };

    for (const fileName of Object.keys(sourceFiles)) {
        const filePath = path.join(projectPath, fileName);
        try {
            if (fs.existsSync(filePath)) {
                sourceFiles[fileName] = fs.readFileSync(filePath, 'utf8');
                console.log(`✅ Loaded source file: ${fileName}`);
            } else {
                console.warn(`⚠️ Warning: Source file not found: ${fileName}. Related sections will be empty.`);
            }
        } catch (err) {
            console.error(`❌ Error reading source file ${fileName}: ${err.message}`);
        }
    }

    // 3. Process Replacements
    let outputContent = templateContent;
    let missingReplacements = [];

    for (const [placeholder, config] of Object.entries(MAPPINGS)) {
        const sourceContent = sourceFiles[config.file];
        let replacement = '';

        if (sourceContent) {
            const match = sourceContent.match(config.regex);
            if (match && match[0]) {
                // Remove the header itself if it's captured in the group but we only want content
                // For simplicity, our regexes capture the header mostly. 
                // Let's clean up a bit: remove the first line if it matches the header pattern
                let content = match[0].trim();
                
                // Optional: Strip the markdown header if the template already has one
                // But for now, direct injection is safer to ensure context.
                replacement = content;
            } else {
                 // Try a looser fallback for entire file if specific section not found (context dependent)
                 // console.log(`No strict match for ${placeholder} in ${config.file}`);
            }
        }

        if (!replacement) {
            replacement = `<!-- Missing content for ${placeholder} from ${config.file} -->`;
            missingReplacements.push(placeholder);
        }

        outputContent = outputContent.replace(placeholder, replacement);
    }

    // 4. Write Output
    const outputPath = path.join(projectPath, 'system_prompt.md');
    try {
        fs.writeFileSync(outputPath, outputContent, 'utf8');
        console.log(`\n🎉 System Prompt generated successfully at:\n   ${outputPath}`);
        
        if (missingReplacements.length > 0) {
            console.log(`\n⚠️  Note: The following sections were not found in source files and were left empty:`);
            missingReplacements.forEach(p => console.log(`   - ${p}`));
        }
    } catch (err) {
        console.error(`❌ Error writing output file: ${err.message}`);
    }
}

// CLI Argument Handling
const args = process.argv.slice(2);
if (args.length !== 1) {
    console.error('Usage: node assemble_system_prompt.js <project_source_path>');
    console.error('Example: node assemble_system_prompt.js Source/Compshare_renewtest');
    process.exit(1);
}

const projectPath = path.resolve(process.cwd(), args[0]);
assemblePrompt(projectPath);
