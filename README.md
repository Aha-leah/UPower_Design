# UPower Design 3.4

**A Multi-Agent AI Team for Automated Design Engineering**

[English](#readme-en) | [中文](#readme-zh)

---

<a id="readme-en"></a>

## English

This package contains the configuration and workflow logic for **UPower Design 3.4** — an AI-native meta-framework that turns abstract ideas into production-ready frontend code through a structured multi-agent pipeline.

## What's New in v3.4

| Change | Impact |
|---|---|
| **Fat Core + Thin Adapter** | Scaffold scripts are fully IDE-agnostic; all paths resolved via CLI args, not `__dirname` |
| **Multi-IDE Support** | First-class adapters for Trae, OpenCode, Cursor, VSCode + Claude |
| **Unified CLI** | `upower.js` entry point: `scaffold`, `ask`, `assemble` subcommands |
| **`--root` parameter** | All core scripts accept explicit project root — works from any directory |
| **`findUpowerRoot()`** | 4-layer fallback: `--upower-root` > `UPOWER_ROOT` env > Trae path > package path |

## 0. Architecture (v3.4)

```
          IDE Layer (Thin Adapter)
  ┌────────┬──────────┬────────┬────────┐
  │  Trae  │ OpenCode │ Cursor │ VSCode │
  └───┬────┴────┬─────┴───┬────┴───┬────┘
      └─────────┴─────────┴────────┘
               CLI Interface
         node upower.js <command>
                    │
          Fat Core Layer (IDE-agnostic)
  ┌──────────────┬────────────┬──────────────────┐
  │scaffold_proj │  ask_ai.js │assemble_system.. │
  └──────────────┴────────────┴──────────────────┘
```

**Key Principle**: Fat Core has zero IDE dependency. Thin Adapter only tells the IDE's AI which CLI command to run. Adding a new IDE = one adapter file, zero core changes.

## 1. Installation

### For Trae
```bash
# Copy the .upower/ directory to your project root
cp -r .upower/ <your_project>/

# Replace your project-manager skill
cp adapters/trae/SKILL.md <your_project>/.trae/skills/project-manager/SKILL.md
```

### For OpenCode
```bash
# Copy .upower/ to OpenCode global skills
cp -r .upower/* ~/.config/opencode/skills/UPower/

# Replace project-manager skill
cp adapters/opencode/SKILL.md ~/.config/opencode/skills/UPower/skills/project-manager/SKILL.md

# (Optional) Copy CLAUDE.md to project root for context
cp adapters/opencode/CLAUDE.md <your_project>/CLAUDE.md
```

### For Cursor
```bash
# Copy .upower/ to your project root
cp -r .upower/ <your_project>/

# Copy .cursorrules to project root
cp adapters/cursor/.cursorrules <your_project>/.cursorrules
```

### For VSCode + Claude
```bash
# Copy .upower/ to your project root
cp -r .upower/ <your_project>/

# Copy CLAUDE.md to project root
cp adapters/vscode/CLAUDE.md <your_project>/CLAUDE.md
```

## 2. CLI Reference

```bash
node .upower/upower.js scaffold --root <project_root> --name <name>
node .upower/upower.js ask      <step> <project_path>
node .upower/upower.js assemble <project_source_path>
node .upower/upower.js --help
```

Steps: `prd | dna | style | specs | motion | skeleton | payload`

## 3. Function Types

| Type | Trigger | Output |
|---|---|---|
| `init` | `/new <Name>` | Project skeleton |
| `define` | "Write PRD", "Generate Brand DNA" | PRD + Brand DNA |
| `design` | "Generate design assets" | Style / Specs / Motion / Skeleton / Payload |
| `assemble` | "Assemble system prompt" | system_prompt.md |
| `build` | `/build` | React application |
| `audit` | "Review quality" | QA report |

**Dependency**: `init → define → design → assemble → build → audit`

## 4. Squad Roster

| Role | Name | Focus Area |
|---|---|---|
| Project Manager | Atlas | Orchestration, Plan generation, State management |
| Product Designer | Alice | Strategy, PRD, Brand DNA, Experience goals |
| Visual Designer | Bob | Aesthetics, Style, Motion, MCP Bridge (Figma + Image Gen) |
| UX Architect | Mia | Structure, Wireframes, Information architecture |
| System Architect | Neo | Tech Stack, Data Models, Tokens |
| Growth Ops | Tina | Copywriting, Marketing ROI |
| Frontend Dev | Ken | React, Tailwind, Code implementation |
| Quality Reviewer | QA | Visual + Interaction quality review |
| Historian | Scribe | Documentation & Knowledge retrieval |
| Internet Access | AR (Agent Reach) | Web/GitHub/Video/Weibo retrieval (optional) |

## 5. Getting Started

```
1. /new <ProjectName>           → init: create project skeleton
2. Describe your product        → define: generate PRD + Brand DNA
3. (auto)                       → define: Mia + Bob generate wireframe
4. Review & approve wireframe   → user confirms before proceeding
5. "Generate design assets"     → design: 5 design asset files
6. "Assemble system prompt"     → assemble: compile system_prompt.md
7. /build                       → build: generate React application
8. (auto)                       → audit: Visual + Interaction QA review
```

## 6. Package Structure

```
UPower_Design3.4/
├── README.md                           # This file
├── .upower/                            # Fat Core (install to project or global skills)
│   ├── upower.js                       #   Unified CLI entry
│   ├── scaffold/
│   │   ├── bin/                        #   Core scripts (IDE-agnostic)
│   │   ├── templates/Object_Name/      #   Project template
│   │   └── prompts/                    #   AI prompt templates
│   ├── skills/                         #   Agent personas
│   ├── knowledgebase/                  #   Reference materials
│   ├── rules/                          #   Constraints & protocols
│   └── governance_policy.md
└── adapters/                           # Thin Adapters (pick your IDE)
    ├── trae/SKILL.md
    ├── opencode/SKILL.md + CLAUDE.md
    ├── cursor/.cursorrules
    └── vscode/CLAUDE.md
```

## 7. Migration from v3.3

1. Replace scaffold scripts in `.trae/scaffold/bin/` with `.upower/scaffold/bin/` versions
2. Replace `project-manager/SKILL.md` with the adapter version for your IDE
3. (Optional) Place `CLAUDE.md` or `.cursorrules` in project root for non-Trae IDEs
4. Existing `.trae/` setups continue working — legacy positional args are still supported

## 8. External Integrations

- **agent-reach** (optional): Internet access helper (Web/GitHub/Video/Weibo)
- **MCP** (via Bob): Figma layout/content extraction, image download, generative image assets

---

# Changelog

## v3.4 - IDE-Agnostic Architecture (Current)
- **Fat Core + Thin Adapter**: Scaffold scripts fully decoupled from IDE directory structure
- **Multi-IDE**: First-class adapters for Trae, OpenCode, Cursor, VSCode + Claude
- **Unified CLI**: `upower.js` entry point with `scaffold`, `ask`, `assemble` subcommands
- **Path Resolution**: `--root` / `--upower-root` / `UPOWER_ROOT` env — zero `__dirname` hardcoding
- **Bug Fix**: OpenCode scaffold pointed to `~/.config/` instead of project root
- **Bug Fix**: `ask_ai.js` / `assemble_system_prompt.js` couldn't find prompts/templates outside Trae

## v3.3 - Workflow Hardening & Open Source Packaging
- Knowledgebase schemas + templates for all asset types
- Structured Plan → Steps pipeline (reproducible & auditable)
- Stop Conditions, automated QA Review, GUI Cockpit spec

## v3.1 - Structured Pipeline & Quality Assurance
- Supervisor → CLI Translator → Action Runner architecture
- PRD system with completeness validation, 28 QA rules

## v2.x - Foundation
- v2.3: Skill spec standardization
- v2.2: Open source packaging, bilingual README
- v2.1: Lab-Clean Brutalism, `/hero` command
- v2.0: Unified Concierge + Builder protocol, MCP integration

---

<a id="readme-zh"></a>

## 中文

本包包含 **UPower Design 3.4** 的配置与工作流逻辑：用一支"模拟的多 Agent 团队"，把抽象需求转成可交付的前端页面。v3.4 的核心升级是**IDE 无关化**。

## v3.4 核心变化

| 变化 | 影响 |
|---|---|
| **Fat Core + Thin Adapter** | Scaffold 脚本完全与 IDE 解耦；路径通过 CLI 参数而非 `__dirname` 解析 |
| **多 IDE 支持** | Trae、OpenCode、Cursor、VSCode + Claude 均有一级适配器 |
| **统一 CLI** | `upower.js` 入口：`scaffold`、`ask`、`assemble` 子命令 |
| **`--root` 参数** | 所有核心脚本接受显式项目根路径——可在任意目录运行 |

## 安装

### Trae
```bash
cp -r .upower/ <你的项目>/
cp adapters/trae/SKILL.md <你的项目>/.trae/skills/project-manager/SKILL.md
```

### OpenCode
```bash
cp -r .upower/* ~/.config/opencode/skills/UPower/
cp adapters/opencode/SKILL.md ~/.config/opencode/skills/UPower/skills/project-manager/SKILL.md
```

### Cursor
```bash
cp -r .upower/ <你的项目>/
cp adapters/cursor/.cursorrules <你的项目>/.cursorrules
```

### VSCode + Claude
```bash
cp -r .upower/ <你的项目>/
cp adapters/vscode/CLAUDE.md <你的项目>/CLAUDE.md
```

## 快速开始

```
1. /new <ProjectName>           → 初始化项目骨架
2. 描述你的产品                  → 生成 PRD + Brand DNA
3. (自动)                       → Mia + Bob 协作生成 wireframe
4. 确认 wireframe                → 用户 approve 后才进入设计阶段
5. "生成设计资产"                → 5 个设计资产文件
6. "组装 system prompt"         → 编译 system_prompt.md
7. /build                       → 生成 React 应用
8. (自动)                       → Visual + Interaction 质检
```

## 从 v3.3 升级

1. 用 `.upower/scaffold/bin/` 的脚本替换 `.trae/scaffold/bin/` 中的原有版本
2. 用对应 IDE 的 adapter 替换 `project-manager/SKILL.md`
3. 原有 `.trae/` 配置继续兼容——旧位置参数仍可使用
