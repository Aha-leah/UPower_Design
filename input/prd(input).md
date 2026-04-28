# UPower Design v3.4 — IDE 无关化迭代 PRD

## 1. 产品背景与问题陈述

### 1.1 现状诊断

UPower Design 3.x 版本在 Trae IDE 中运行良好，但当用户尝试在其他 IDE（OpenCode、Cursor、VSCode）中使用时，遭遇了系统性的技术断裂。

**已确认的技术断裂点：**

| 断裂点 | 症状 | 根本原因 |
|--------|------|----------|
| `scaffold_project.js` 第 13 行 | 在 OpenCode 中运行时 rootDir 指向 `~/.config/` 而非项目根目录 | 硬编码 `path.resolve(__dirname, '../../../')` 依赖 Trae 的 `.trae/scaffold/bin/` 目录结构 |
| `ask_ai.js` 第 5 行 | 无法找到 `../guideline/` 和 `../knowledgebase/` | 使用 `__dirname` 相对路径，在非 Trae 环境下路径解析错误 |
| `assemble_system_prompt.js` 第 5 行 | 无法找到 `system_prompt_template.md` | 同上，依赖 `__dirname` 的相对路径 |
| `project-manager` SKILL.md `/new` 指令 | AI 不知道该调用哪个脚本 | 命令描述中无具体执行指令，仅靠 AI "记忆" |

### 1.2 用户痛点

**用户的心理状态：**
- **困惑**："我明明按照文档操作，为什么提示找不到文件？"
- **挫败**："同样的命令在 Trae 能跑，在 Cursor 就报错"
- **不信任**："这个框架是不是只支持 Trae？"

**失败场景：**
1. 用户在 OpenCode 中输入 `/new MyProject`，AI 尝试执行但找不到正确的 scaffold 脚本
2. 用户手动运行 `node .trae/scaffold/bin/scaffold_project.js MyProject`，结果项目被创建到了 `~/.config/` 下
3. 用户放弃，认为 UPower 是一个 "Trae-only" 的工具

### 1.3 核心洞察

**Fat Core + Thin Adapter 架构**

问题的本质不是 "修复路径"，而是重新设计架构：

- **Fat Core**：IDE 无关的核心脚本层，通过 CLI 参数（`--root`、`--name`）接收所有必要信息
- **Thin Adapter**：每个 IDE 一个极轻的适配器文件，只做一件事：告诉该 IDE 的 AI "遇到 `/new` 请跑这个 CLI"
- **协议即文档**：CLI 接口本身就是协议，无需额外维护文档；新增 IDE 只需新写一个 10 行 adapter

---

## 2. 目标用户 & 使用场景

### 2.1 主要用户

| 用户类型 | 特征 | 使用场景 |
|----------|------|----------|
| **多 IDE 用户** | 同时在 Trae、OpenCode、Cursor 间切换 | 希望同一套 workflow 在任何 IDE 都能工作 |
| **团队协作用户** | 团队成员使用不同 IDE | 需要统一的 onboarding 体验，不因 IDE 而异 |
| **新用户** | 第一次接触 UPower | 在任意 IDE 中都能顺利完成第一个项目的创建 |

### 2.2 使用场景

**场景 A：OpenCode 新用户**
> 用户在 OpenCode 中克隆了 UPower 仓库，输入 `/new LandingPage`，期望立即看到标准项目结构被创建在 `Source/LandingPage/`

**场景 B：Cursor 迁移用户**
> 用户从 Trae 迁移到 Cursor，希望继续使用 UPower，只需添加 Cursor adapter 即可无缝衔接

**场景 C：CI/CD 集成**
> 在 GitHub Actions 中调用 `node upower.js --root . --name Project`，无需关心运行环境的 IDE

---

## 3. 核心设计原则

### 3.1 Fat Core + Thin Adapter

```
┌─────────────────────────────────────────────────────────────┐
│                      IDE Layer                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Trae    │  │ OpenCode │  │  Cursor  │  │  VSCode  │     │
│  │ Adapter  │  │ Adapter  │  │ Adapter  │  │ Adapter  │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │             │             │            │
│       └─────────────┴─────────────┴─────────────┘            │
│                     CLI Interface                            │
│              node upower.js --root <path>                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Fat Core Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │scaffold_project│  │   ask_ai.js   │  │assemble_system │       │
│  │    .js       │  │               │  │    _prompt.js  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  特性：                                                      │
│  - 零 IDE 依赖                                               │
│  - 纯 CLI 参数驱动                                           │
│  - 可在任何 Node.js 环境运行                                 │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 零魔法原则

**反模式：** "AI 应该知道要调用什么脚本"

**正模式：** 每个 AI 行为都有明确的脚本支撑

- `/new` 命令 → 明确映射到 `node upower.js --root <cwd> --name <name>`
- 路径解析 → 通过 `--root` 显式传入，而非依赖 `__dirname` 推算
- 模板加载 → 通过绝对路径或相对 `--root` 的路径，而非相对脚本位置

### 3.3 向后兼容

Trae 现有项目必须不受影响：
- 保留 `.trae/scaffold/bin/` 下的脚本作为 shim/wrapper
- Trae adapter 可以是最薄的，直接调用 Fat Core

---

## 4. 功能需求

### 4.1 Fat Core 重构（P0）

#### 4.1.1 `scaffold_project.js` —— 支持 CLI 参数

**当前问题：**
```javascript
const rootDir = path.resolve(__dirname, '../../../');  // 硬编码，IDE 相关
const projectName = process.argv[2];  // 只有 name，没有 root
```

**目标状态：**
```javascript
// 支持：node scaffold_project.js --root /path/to/project --name ProjectName
const args = parseArgs(process.argv);
const rootDir = path.resolve(args.root || process.cwd());
const projectName = args.name;
```

**验收标准：**
- [ ] 支持 `--root <path>` 参数，指定项目根目录
- [ ] 支持 `--name <name>` 参数，指定项目名称
- [ ] 当 `--root` 未提供时，默认使用 `process.cwd()`
- [ ] 所有路径计算基于 `--root`，而非 `__dirname`
- [ ] 在任意目录运行 `node scaffold_project.js --root /any/path --name Test`，项目创建到 `/any/path/Source/Test/`

#### 4.1.2 `ask_ai.js` —— 动态路径，不依赖 `__dirname`

**当前问题：**
```javascript
const PROMPT_GUIDE_PATH = path.join(__dirname, '../guideline/step_guide_prompt.md');
const KNOWLEDGE_BASE_PATH = path.join(__dirname, '../knowledgebase/prompt_tag_database');
```

**目标状态：**
```javascript
// 支持：node ask_ai.js --root /path/to/project <step> <project_path>
// 或：路径通过相对 --root 计算
const basePath = args.root ? path.resolve(args.root) : findProjectRoot();
const PROMPT_GUIDE_PATH = path.join(basePath, 'Docs/guideline/step_guide_prompt.md');
```

**验收标准：**
- [ ] 支持 `--root` 参数指定 UPower 框架根目录
- [ ] 所有资源路径（guideline、knowledgebase、templates）基于 `--root` 计算
- [ ] 在非 Trae 环境下能正确找到 `Docs/guideline/` 等目录
- [ ] 在 OpenCode 中运行 `node ask_ai.js --root /path/to/upower style Source/MyProject` 成功生成 prompt

#### 4.1.3 `assemble_system_prompt.js` —— 同上

**当前问题：**
```javascript
const TEMPLATE_PATH = path.join(__dirname, 'system_prompt_template.md');
```

**目标状态：**
```javascript
const basePath = args.root ? path.resolve(args.root) : findProjectRoot();
const TEMPLATE_PATH = path.join(basePath, 'Docs/Prompt_maker/system_prompt_template.md');
```

**验收标准：**
- [ ] 支持 `--root` 参数
- [ ] 模板路径基于 `--root` 计算
- [ ] 源文件路径（style_prompt.md 等）基于传入的 projectPath 计算（保持不变）

#### 4.1.4 统一入口 `upower.js`（可选 wrapper）

**需求：** 提供一个统一的 CLI 入口，简化调用

**接口设计：**
```bash
node upower.js scaffold --root <path> --name <name>
node upower.js ask --root <path> <step> <project_path>
node upower.js assemble --root <path> <project_path>
```

**验收标准：**
- [ ] `upower.js` 作为统一入口存在
- [ ] 支持 `scaffold`、`ask`、`assemble` 子命令
- [ ] 每个子命令正确转发参数到对应脚本
- [ ] 提供 `--help` 输出使用说明

### 4.2 Thin Adapter 层（P0）

#### 4.2.1 Trae Adapter（验证现有是否需要改动）

**现状：** `.trae/skills/project-manager/SKILL.md` 已存在

**检查项：**
- [ ] 确认现有 `/new` 命令在 Fat Core 重构后仍能工作
- [ ] 如需改动，更新为调用 Fat Core CLI

**目标状态：**
```markdown
<item cmd="/new [Name]">
Initialize project skeleton only (Source template). Never auto-build.
Execution: node /path/to/upower.js scaffold --root <current_working_directory> --name <Name>
</item>
```

#### 4.2.2 OpenCode Adapter

**交付物：**
1. **SKILL.md 更新** —— 补充 `/new` 执行指令
2. **CLAUDE.md 模板** —— OpenCode 全局 rules 注入

**SKILL.md 更新内容：**
```markdown
<item cmd="/new [Name]">
Initialize project skeleton only (Source template). Never auto-build.
Execution: 
1. Determine current working directory (cwd)
2. Run: node <upower_root>/upower.js scaffold --root <cwd> --name <Name>
3. Verify Source/<Name>/ directory created
</item>
```

**CLAUDE.md 模板内容：**
```markdown
# UPower Design for OpenCode

## Commands
- `/new [Name]` → Run: node <upower_root>/upower.js scaffold --root <cwd> --name [Name]
- `/build` → ...

## Project Structure
...
```

**验收标准：**
- [ ] OpenCode 用户输入 `/new TestProject`，AI 能正确执行 scaffold 命令
- [ ] 项目创建在正确的位置（用户当前工作目录下的 `Source/TestProject/`）

#### 4.2.3 Cursor Adapter

**交付物：** `.cursorrules` 文件模板

**内容：**
```markdown
# UPower Design Rules for Cursor

## Available Commands
- `/new [Name]`: Initialize project
  - Execute: node <upower_root>/upower.js scaffold --root <cwd> --name [Name]
  - Creates: Source/[Name]/ directory from template

## File Locations
- Scaffold scripts: <upower_root>/upower.js
- Templates: <upower_root>/Docs/「Template」Object_Name/
```

**验收标准：**
- [ ] Cursor 用户输入 `/new TestProject`，AI 能正确执行
- [ ] 项目创建在正确位置

#### 4.2.4 VSCode/Claude Adapter

**交付物：** `CLAUDE.md` 文件（VSCode Claude 扩展使用）

**内容：** 与 OpenCode CLAUDE.md 类似，但针对 VSCode 环境调整

**验收标准：**
- [ ] VSCode + Claude 扩展用户能正常使用 `/new` 命令

### 4.3 `project-manager` SKILL.md 更新（P0）

**当前问题：**
```markdown
<item cmd="/new">Initialize project skeleton only (Source template). Never auto-build.</item>
```

**目标状态：**
```markdown
<item cmd="/new [Name]">
Initialize project skeleton only (Source template). Never auto-build.
Execution:
1. Identify UPower root directory (where upower.js or scaffold/ resides)
2. Get current working directory (cwd)
3. Run: node <upower_root>/upower.js scaffold --root <cwd> --name [Name]
4. Verify Source/[Name]/ created with:
   - input/ directory
   - project_state.json (status: "raw")
5. Report success or error
</item>
```

**验收标准：**
- [ ] SKILL.md 中 `/new` 命令包含明确的执行步骤
- [ ] AI 执行 `/new` 时不再依赖 "记忆"，而是遵循文档指令

### 4.4 Deliverable 目录结构（P1）

**最终产物存放位置：** `待产品化/UPower_Design3.4/`

**目录结构：**
```
待产品化/UPower_Design3.4/
├── README.md                    # v3.4 版本说明
├── CHANGELOG.md                 # 变更日志
├── upower.js                    # Fat Core 统一入口
├── core/                        # Fat Core 脚本
│   ├── scaffold_project.js
│   ├── ask_ai.js
│   └── assemble_system_prompt.js
├── adapters/                    # Thin Adapter 层
│   ├── trae/
│   │   └── SKILL.md             # Trae project-manager skill
│   ├── opencode/
│   │   ├── SKILL.md
│   │   └── CLAUDE.md
│   ├── cursor/
│   │   └── .cursorrules
│   └── vscode/
│       └── CLAUDE.md
├── Docs/                        # 共享文档（从原 Docs/ 复制）
│   ├── guideline/
│   ├── knowledgebase/
│   ├── Prompt_maker/
│   └── 「Template」Object_Name/
└── tests/                       # Smoke tests
    ├── test-scaffold.js
    ├── test-ask.js
    └── test-assemble.js
```

**验收标准：**
- [ ] 所有文件按结构存放
- [ ] `upower.js` 可执行
- [ ] 每个 adapter 包含完整的使用说明

---

## 5. 非功能需求

### 5.1 向后兼容

- Trae 现有项目不受影响
- 现有 `.trae/scaffold/bin/` 脚本可作为 wrapper 保留，内部调用 Fat Core
- 用户升级 v3.4 后，原有工作流继续工作

### 5.2 零魔法

- 每一步 AI 行为都有明确脚本支撑
- 不依赖 AI "应该记得" 什么
- 所有路径计算显式、可追溯

### 5.3 可测试性

每个 adapter 有对应 smoke test：

```javascript
// test-scaffold.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testDir = '/tmp/upower-test-' + Date.now();
fs.mkdirSync(testDir, { recursive: true });

// Test scaffold
execSync(`node ${upowerPath}/upower.js scaffold --root ${testDir} --name TestProject`);

// Verify
if (!fs.existsSync(path.join(testDir, 'Source/TestProject/input'))) {
  throw new Error('Scaffold failed');
}

console.log('✅ Scaffold test passed');
```

### 5.4 文档完整性

- 每个脚本提供 `--help` 输出
- README.md 包含各 IDE 的安装说明
- CHANGELOG.md 记录 v3.4 的破坏性变更（如有）

---

## 6. 成功标准（Crit 测试目标）

### 6.1 必须通过的场景

| 场景 | 测试步骤 | 预期结果 |
|------|----------|----------|
| **OpenCode /new** | 1. 在 OpenCode 中打开 UPower 仓库<br>2. 输入 `/new OpenTest` | `Source/OpenTest/` 目录被创建，包含标准模板结构 |
| **Cursor /new** | 1. 在 Cursor 中打开 UPower 仓库<br>2. 输入 `/new CursorTest` | `Source/CursorTest/` 目录被创建 |
| **Trae 不退化** | 1. 在 Trae 中使用 v3.4<br>2. 输入 `/new TraeTest` | 与 v3.3 行为一致，项目正确创建 |
| **CLI 直接调用** | `node upower.js scaffold --root /tmp --name CLITest` | `/tmp/Source/CLITest/` 被创建 |
| **ask_ai 跨 IDE** | `node upower.js ask --root <upower_root> style Source/Test` | 正确生成 `prompt_for_style.md` |

### 6.2 失败处理

| 失败场景 | 预期行为 |
|----------|----------|
| `--root` 指向不存在目录 | 报错："Root directory does not exist" |
| `--name` 包含非法字符 | 报错："Invalid project name" |
| 模板目录不存在 | 报错："Template not found at <path>" |
| 目标目录已存在 | 提示："Source/<Name> already exists, skip creation" |

---

## 7. 不在范围内

### 7.1 v3.4 明确排除

| 项目 | 原因 | 计划版本 |
|------|------|----------|
| UI/设计资产生成逻辑改动 | 保持核心功能稳定 | v3.5+ |
| Happy_card 迁移 | 测试项目，非核心 | v3.5+ |
| 新增 design asset 类型 | 范围控制 | v3.5+ |
| 自动化测试框架 | 手动 smoke test 足够 | v3.5+ |
| Docker 支持 | 非关键路径 | Future |

### 7.2 技术债务（记录但不修复）

- `ask_ai.js` 的 `extractPromptFromGuide` 使用正则解析 Markdown，未来可考虑改用 frontmatter
- `assemble_system_prompt.js` 的 `MAPPINGS` 硬编码，未来可配置化

---

## 8. 风险与缓解

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| Fat Core 重构破坏 Trae 兼容性 | 中 | 高 | 保留 `.trae/scaffold/bin/` 下的 wrapper 脚本，内部调用 Fat Core |
| CLI 参数设计不满足所有 IDE | 低 | 中 | 提前与 OpenCode/Cursor 用户验证接口设计 |
| 路径计算在 Windows 上失败 | 中 | 中 | 使用 `path.join()` 和 `path.resolve()`，避免硬编码斜杠 |
| 文档更新不及时 | 高 | 中 | PRD 中明确文档要求，作为验收标准 |

---

## 9. 附录

### 9.1 CLI 接口草案

```bash
# Scaffold
node upower.js scaffold --root <path> --name <name>

# Ask AI
node upower.js ask --root <upower_root> <step> <project_path>
# step: prd | dna | style | specs | motion | skeleton | payload

# Assemble
node upower.js assemble --root <upower_root> <project_path>
```

### 9.2 路径解析策略

```javascript
// Fat Core 中的路径解析
function resolveUpowerRoot(args) {
  if (args.root) {
    return path.resolve(args.root);
  }
  // 尝试从环境变量获取
  if (process.env.UPOWER_ROOT) {
    return path.resolve(process.env.UPOWER_ROOT);
  }
  // 默认：当前工作目录
  return process.cwd();
}

// 所有资源路径基于 upowerRoot
const guidelinePath = path.join(upowerRoot, 'Docs/guideline/step_guide_prompt.md');
const templatePath = path.join(upowerRoot, 'Docs/「Template」Object_Name');
```

### 9.3 参考文档

- [UPower OpenCode Migration Guide](/UPower_OpenCode_Migration.md)
- [Architecture Design](/Docs/Architecture_Design.md)
- [Step by Step for FM](/Docs/step_by_step_forFM.md)

---

**文档版本：** v1.0  
**创建日期：** 2026-04-24  
**作者：** Alice (Product Muse)  
**状态：** Draft for Review
