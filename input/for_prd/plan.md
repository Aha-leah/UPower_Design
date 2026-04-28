# UPower Design v3.4 实施计划

**目标**：将 scaffold 层从 Trae 硬编码改造为 Fat Core + Thin Adapter 架构，实现主流 IDE 无关化。  
**任务总数**：14 个 | **并行组**：3 组可并行  
**交付路径**：`待产品化/UPower_Design3.4/`

---

## 并行执行图

```
Phase 1 (并行)                    Phase 2 (并行)           Phase 3           Phase 4
─────────────────────────         ────────────────────     ─────────         ──────────────
T1.1 scaffold_project.js ──┐                               T3.1 test-scaffold
T1.2 ask_ai.js           ──┤──→ Phase 2 ──┬─ T2.1 Trae    T3.2 test-ask   ──→ T4.1~T4.4
T1.3 assemble_system.js  ──┤              ├─ T2.2 OpenCode T3.3 test-assemble
T1.4 upower.js 入口      ──┘              ├─ T2.3 Cursor
                                          └─ T2.4 VSCode
```

---

## Phase 1：Fat Core 重构（T1.1 ~ T1.4 全部并行）

### T1.1 改造 `scaffold_project.js`

**输入**：`~/.config/opencode/skills/UPower/scaffold/bin/scaffold_project.js`  
**输出**：`UPower_Design3.4/core/scaffold_project.js`

**具体改动**：

| 行号 | 原代码 | 改为 |
|------|--------|------|
| 5 | `const projectName = process.argv[2]` | 替换为 `parseArgs()` 解析 `--name` |
| 13 | `path.resolve(__dirname, '../../../')` | `path.resolve(args.root \|\| process.cwd())` |
| 24 | `path.resolve(__dirname, '../templates/Object_Name')` | `path.join(upowerRoot, 'scaffold/templates/Object_Name')` |

**新增 parseArgs 逻辑**：
```javascript
function parseArgs(argv) {
  const args = { root: null, name: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--root') args.root = argv[++i];
    else if (argv[i] === '--name') args.name = argv[++i];
    else if (!args.name && !argv[i].startsWith('--')) args.name = argv[i]; // 向后兼容位置参数
  }
  return args;
}
```

**同时增加**：`UPOWER_ROOT` 环境变量 fallback（`process.env.UPOWER_ROOT`）

**验收命令**：
```bash
node UPower_Design3.4/core/scaffold_project.js --root /tmp/uptest --name SmokeTest
ls /tmp/uptest/Source/SmokeTest/input
# 期望：看到 for_prd/ brand_dna.md prd(input).md
```

---

### T1.2 改造 `ask_ai.js`

**输入**：`~/.config/opencode/skills/UPower/scaffold/bin/ask_ai.js`  
**输出**：`UPower_Design3.4/core/ask_ai.js`

**具体改动**：

| 行号 | 原代码 | 改为 |
|------|--------|------|
| 5 | `path.join(__dirname, '../prompts/step_guide_prompt.md')` | `path.join(upowerRoot, 'scaffold/prompts/step_guide_prompt.md')` |
| 6 | `path.resolve(__dirname, '../../knowledgebase/prompt_tag_database')` | `path.join(upowerRoot, 'knowledgebase/prompt_tag_database')` |

**参数签名变更**：
```bash
# 原
node ask_ai.js <step> <project_path>

# 新（向后兼容，--root 可选）
node ask_ai.js --root <upower_root> <step> <project_path>
```

**upowerRoot 解析优先级**：`--root 参数` > `UPOWER_ROOT 环境变量` > `process.cwd()`

**验收命令**：
```bash
UPOWER_ROOT=/Users/lealee/.config/opencode/skills/UPower \
node UPower_Design3.4/core/ask_ai.js style Source/UPower_v3.4
# 期望：生成 Source/UPower_v3.4/prompt_for_style.md，无路径报错
```

---

### T1.3 改造 `assemble_system_prompt.js`

**输入**：`~/.config/opencode/skills/UPower/scaffold/bin/assemble_system_prompt.js`  
**输出**：`UPower_Design3.4/core/assemble_system_prompt.js`

**具体改动**：

| 行号 | 原代码 | 改为 |
|------|--------|------|
| 5 | `path.join(__dirname, 'system_prompt_template.md')` | `path.join(upowerRoot, 'scaffold/bin/system_prompt_template.md')` |

**参数签名变更**：
```bash
# 原
node assemble_system_prompt.js <project_source_path>

# 新
node assemble_system_prompt.js --root <upower_root> <project_source_path>
```

**验收命令**：
```bash
node UPower_Design3.4/core/assemble_system_prompt.js \
  --root /Users/lealee/.config/opencode/skills/UPower \
  Source/UPower_v3.4
# 期望：生成 Source/UPower_v3.4/system_prompt.md
```

---

### T1.4 创建 `upower.js` 统一入口

**输出**：`UPower_Design3.4/upower.js`  
**这是新建文件，无原始对应。**

**CLI 接口**：
```bash
node upower.js scaffold --root <path> --name <name>
node upower.js ask     --root <upower_root> <step> <project_path>
node upower.js assemble --root <upower_root> <project_path>
node upower.js --help
```

**实现逻辑**：纯转发，不含业务逻辑：
```javascript
#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const CORE = path.join(__dirname, 'core');
const [,, cmd, ...rest] = process.argv;

const COMMANDS = {
  scaffold: 'scaffold_project.js',
  ask:      'ask_ai.js',
  assemble: 'assemble_system_prompt.js',
};

if (!cmd || !COMMANDS[cmd]) {
  console.log('Usage: node upower.js <scaffold|ask|assemble> [options]');
  process.exit(cmd ? 1 : 0);
}

const result = spawnSync('node', [path.join(CORE, COMMANDS[cmd]), ...rest], { stdio: 'inherit' });
process.exit(result.status);
```

**验收命令**：
```bash
node UPower_Design3.4/upower.js --help
node UPower_Design3.4/upower.js scaffold --root /tmp/uptest --name HelloWorld
```

---

## Phase 2：Thin Adapter 层（T2.1 ~ T2.4 全部并行）

### T2.1 Trae Adapter

**输出**：`UPower_Design3.4/adapters/trae/SKILL.md`  
**操作**：复制现有 project-manager SKILL.md，在 Commands 节补充 `/new` 执行步骤：

```markdown
## Commands

- `/new [Name]`
  Initialize project skeleton only. Never auto-build.
  **Execution**:
  1. Determine UPower root (`.trae/` parent directory)
  2. Run: `node <upower_root>/upower.js scaffold --root <cwd> --name [Name]`
  3. Verify `Source/[Name]/` created with standard template structure
```

**验收**：在 Trae 中输入 `/new TraeTest`，确认 `Source/TraeTest/` 被创建且结构正确。

---

### T2.2 OpenCode Adapter

**输出**：
- `UPower_Design3.4/adapters/opencode/SKILL.md`
- `UPower_Design3.4/adapters/opencode/CLAUDE.md`

**SKILL.md** 在 project-manager 的 Commands 节补充：
```markdown
- `/new [Name]`
  Initialize project skeleton only. Never auto-build.
  **Execution**:
  1. Identify UPower root (where `upower.js` lives — typically `~/.config/opencode/skills/UPower/`)
  2. Get current working directory (the user's project root)
  3. Run: `node <upower_root>/upower.js scaffold --root <cwd> --name [Name]`
  4. Verify `Source/[Name]/input/` and `project_state.json` exist
  5. Report: "✅ Project [Name] initialized at Source/[Name]/"
```

**CLAUDE.md** 内容（放在用户项目根目录）：
```markdown
# UPower Design — OpenCode Rules

## Slash Commands
- `/new [Name]` → `node ~/.config/opencode/skills/UPower/upower.js scaffold --root <cwd> --name [Name]`
- `/build`      → Read `Source/[Name]/project_state.json`, execute next phase
- `/plan`       → Show current project state and pending steps

## Project Structure (after /new)
Source/[Name]/
├── input/
│   ├── for_prd/       # Place raw requirements here
│   ├── prd(input).md  # Generated by Alice
│   └── brand_dna.md   # Generated by Alice
├── style_prompt.md
├── design_system_specs.md
├── animation_prompts.md
├── skeleton_template.json
├── web_content.js
└── system_prompt.md

## Notes
- UPower Root: `~/.config/opencode/skills/UPower/`
- Never manually edit generated files in `projects/`
```

**验收命令**：在 OpenCode 中打开任意目录，输入 `/new OpenTest`，期望 `Source/OpenTest/` 被正确创建。

---

### T2.3 Cursor Adapter

**输出**：`UPower_Design3.4/adapters/cursor/.cursorrules`

**内容**：
```markdown
# UPower Design Rules for Cursor

## Available Slash Commands

### /new [Name]
Initialize a new UPower project.
**Steps to execute**:
1. Find UPower root (the directory containing `upower.js`)
2. Run in terminal: `node <upower_root>/upower.js scaffold --root <current_project_root> --name [Name]`
3. Verify `Source/[Name]/` was created
4. Confirm to user: "Project [Name] initialized"

### /build
Execute the manifest-driven build pipeline.
Read `Source/[Name]/project_state.json` → execute the next phase.

### /plan
Show current project state and next steps.

## Project Root Convention
- Source assets: `Source/[Name]/`
- Built output: `projects/[Name]/`
- UPower scripts: `<upower_root>/upower.js`

## Never
- Auto-build without explicit /build command
- Modify files in `projects/` directly
- Skip project_state.json status check
```

**验收**：在 Cursor 中打开 UPower 项目，输入 `/new CursorTest`，期望脚本被执行。

---

### T2.4 VSCode/Claude Adapter

**输出**：`UPower_Design3.4/adapters/vscode/CLAUDE.md`

**内容**（与 OpenCode 版相近，调整说明）：
```markdown
# UPower Design — VSCode/Claude Rules

## Setup
Place this file as `CLAUDE.md` in your project root.

## Slash Commands

### /new [Name]
Run: `node <upower_root>/upower.js scaffold --root <cwd> --name [Name]`
UPower root is typically where you installed/cloned the UPower package.

### /build
Read `Source/[Name]/project_state.json` and execute the next phase in the pipeline.

### /plan
Display current project status.

## Expected Structure After /new
Source/[Name]/input/for_prd/   ← Put raw requirements here
Source/[Name]/input/prd(input).md
Source/[Name]/input/brand_dna.md
... (standard template files)
```

---

## Phase 3：Smoke Tests（依赖 Phase 1 完成）

### T3.1 `test-scaffold.js`

**输出**：`UPower_Design3.4/tests/test-scaffold.js`

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const UPOWER = path.resolve(__dirname, '../upower.js');
const TEST_ROOT = '/tmp/upower-test-' + Date.now();
fs.mkdirSync(TEST_ROOT, { recursive: true });

console.log('🧪 Test: scaffold --root --name');
execSync(`node "${UPOWER}" scaffold --root "${TEST_ROOT}" --name SmokeTest`, { stdio: 'inherit' });

const checks = [
  `${TEST_ROOT}/Source/SmokeTest/input`,
  `${TEST_ROOT}/Source/SmokeTest/input/for_prd`,
];
checks.forEach(p => {
  if (!fs.existsSync(p)) throw new Error(`❌ Missing: ${p}`);
  console.log(`✅ Exists: ${p}`);
});

fs.rmSync(TEST_ROOT, { recursive: true });
console.log('✅ scaffold test passed');
```

**验收命令**：`node UPower_Design3.4/tests/test-scaffold.js`

---

### T3.2 `test-ask.js`

**输出**：`UPower_Design3.4/tests/test-ask.js`

验证 ask_ai.js 能在指定 `--root` 下找到 prompts/ 和 knowledgebase/，并正确生成 `prompt_for_*.md`。

**验收命令**：
```bash
node UPower_Design3.4/tests/test-ask.js \
  --upower-root /Users/lealee/.config/opencode/skills/UPower \
  --project-path Source/UPower_v3.4
```

---

### T3.3 `test-assemble.js`

**输出**：`UPower_Design3.4/tests/test-assemble.js`

验证 assemble_system_prompt.js 能读取模板并生成 `system_prompt.md`（即使源文件为空，也应生成带 `<!-- Missing -->` 注释的文件而非崩溃）。

**验收命令**：`node UPower_Design3.4/tests/test-assemble.js`

---

## Phase 4：交付打包（依赖 1+2+3 全部完成）

### T4.1 复制 Docs/ 必要文件

从 `~/.config/opencode/skills/UPower/` 复制到 `UPower_Design3.4/Docs/`：

| 复制源 | 目标 | 说明 |
|--------|------|------|
| `scaffold/prompts/` | `Docs/prompts/` | ask_ai 依赖的 prompt 模板 |
| `scaffold/bin/system_prompt_template.md` | `Docs/system_prompt_template.md` | assemble 依赖的主模板 |
| `scaffold/templates/Object_Name/` | `Docs/templates/Object_Name/` | /new 的项目模板 |
| `knowledgebase/prompt_tag_database/` | `Docs/knowledgebase/prompt_tag_database/` | ask_ai knowledge base |

**验收**：`ls UPower_Design3.4/Docs/` 包含以上所有目录

---

### T4.2 写 `README.md`

**输出**：`UPower_Design3.4/README.md`

必须包含：
- 架构说明（Fat Core + Thin Adapter 图）
- 各 IDE 安装步骤（Trae / OpenCode / Cursor / VSCode）
- 快速开始（`/new <Name>` 后的完整 workflow）
- CLI 参考（`upower.js` 所有子命令）

---

### T4.3 写 `CHANGELOG.md`

**输出**：`UPower_Design3.4/CHANGELOG.md`

```markdown
# Changelog

## v3.4.0 — IDE 无关化 (2026-04)

### Breaking Changes
- `scaffold_project.js`：移除对 `__dirname` 的依赖，必须通过 `--root` 或 `UPOWER_ROOT` 指定框架根目录

### New Features
- `upower.js`：统一 CLI 入口，支持 scaffold / ask / assemble 子命令
- Thin Adapter：为 Trae / OpenCode / Cursor / VSCode 提供 adapter 文件
- `--root` 参数：所有核心脚本支持显式路径注入

### Migration Guide（从 v3.3 升级）
1. 在 `.trae/scaffold/bin/` 下的原有脚本添加 `--root` shim 调用新版 core/
2. 将 project-manager SKILL.md 的 `/new` 命令替换为 T2.1/T2.2 adapter 版本
```

---

### T4.4 最终目录验证

**验收命令**：
```bash
# 检查目录结构完整性
find "待产品化/UPower_Design3.4" -type f | sort

# 跑全套 smoke test
node UPower_Design3.4/tests/test-scaffold.js
node UPower_Design3.4/tests/test-ask.js
node UPower_Design3.4/tests/test-assemble.js
```

---

## Crit 测试清单（最终验收）

来自 PRD 6.1 节，全部通过方可标记 v3.4 完成：

- [ ] **OpenCode `/new`**：OpenCode 中输入 `/new OpenTest` → `Source/OpenTest/` 正确创建，包含标准模板结构
- [ ] **Cursor `/new`**：Cursor 中输入 `/new CursorTest` → `Source/CursorTest/` 正确创建
- [ ] **Trae 不退化**：Trae 中输入 `/new TraeTest` → 与 v3.3 行为一致
- [ ] **CLI 直接调用**：`node upower.js scaffold --root /tmp --name CLITest` → `/tmp/Source/CLITest/` 被创建
- [ ] **ask_ai 跨 IDE**：`node upower.js ask --root <upower_root> style Source/Test` → 正确生成 `prompt_for_style.md`
- [ ] **错误处理 - root 不存在**：报错 "Root directory does not exist"
- [ ] **错误处理 - 目标已存在**：提示 "Source/<Name> already exists, skip creation"
- [ ] **--help 输出**：`node upower.js --help` 输出使用说明，退出码 0

---

**计划版本**：v1.0  
**创建日期**：2026-04-24  
**状态**：Ready for Execution
