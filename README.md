# UPower Design v3.4 — IDE 无关化

**架构**：Fat Core + Thin Adapter  
**状态**：✅ 生产就绪，支持 Trae/OpenCode/Cursor/VSCode

> **最新更新 (2025-04-27)**：`scaffold` 命令已优化为完全非交互式，Tailwind CSS 固定为 v3 以确保跨环境稳定性。详见 [CHANGELOG.md](./CHANGELOG.md)。

---

## 架构

```
          IDE Layer（Thin Adapter）
  ┌────────┬──────────┬────────┬────────┐
  │  Trae  │ OpenCode │ Cursor │ VSCode │
  └───┬────┴────┬─────┴───┬────┴───┬────┘
      └─────────┴─────────┴────────┘
               CLI Interface
         node upower.js <command>
                    │
          Fat Core Layer（IDE 无关）
  ┌──────────────┬────────────┬──────────────────┐
  │scaffold_proj │  ask_ai.js │assemble_system.. │
  └──────────────┴────────────┴──────────────────┘
```

## 目录结构

```
UPower_v3.4/
├── upower.js                    ← 统一 CLI 入口
├── core/                        ← Fat Core 脚本
│   ├── scaffold_project.js
│   ├── ask_ai.js
│   └── assemble_system_prompt.js
├── adapters/                    ← Thin Adapter 层
│   ├── trae/SKILL.md
│   ├── opencode/SKILL.md + CLAUDE.md
│   ├── cursor/.cursorrules
│   └── vscode/CLAUDE.md
├── Docs/                        ← 共享资源
│   ├── prompts/
│   ├── templates/Object_Name/
│   ├── system_prompt_template.md
│   └── knowledgebase/
├── tests/
│   ├── test-scaffold.js
│   ├── test-ask.js
│   └── test-assemble.js
└── input/                       ← 规划文档
    ├── prd(input).md
    └── for_prd/plan.md
```

## CLI 参考

```bash
node upower.js scaffold --root <project_root> --name <name>
node upower.js ask      <step> <project_path>
node upower.js assemble <project_source_path>
node upower.js --help
```

## 各 IDE 安装

### Trae
已原生支持。将 `adapters/trae/SKILL.md` 替换 `.trae/skills/project-manager/SKILL.md`。

### OpenCode
1. 将 `adapters/opencode/SKILL.md` 替换 `~/.config/opencode/skills/UPower/skills/project-manager/SKILL.md`
2. 将 `adapters/opencode/CLAUDE.md` 复制到项目根目录

### Cursor
**推荐方式（一键安装）**：
```bash
bash Source/UPower_v3.4/adapters/cursor/install.sh /path/to/your/project
```

**手动方式**：
将 `adapters/cursor/.cursorrules` 复制到项目根目录。

**验证安装**：
```bash
bash Source/UPower_v3.4/adapters/cursor/verify.sh /path/to/your/project
```

**卸载**：
```bash
bash Source/UPower_v3.4/adapters/cursor/uninstall.sh /path/to/your/project
```

### VSCode + Claude
将 `adapters/vscode/CLAUDE.md` 复制到项目根目录。

## 快速开始

```bash
# 1. 初始化项目
node upower.js scaffold --root /path/to/your/project --name MyLanding

# 2. 在 IDE 中输入 /opentalk 对齐方向

# 3. 放素材到 Source/MyLanding/input/for_prd/

# 4. 生成设计资产
node upower.js ask style Source/MyLanding
node upower.js ask specs Source/MyLanding
node upower.js ask motion Source/MyLanding

# 5. 组装系统提示词
node upower.js assemble Source/MyLanding

# 6. /build
```
