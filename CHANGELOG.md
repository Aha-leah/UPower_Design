# Changelog

## v3.4.1 — Scaffold 稳定性修复 (2026-04-27)

### Bug Fixes
- **Scaffold 非交互式执行**：`npm create vite@latest` 添加 `--no-interactive` 参数，确保在 CI/IDE 环境中稳定执行，避免交互式询问导致流程挂起或意外启动 dev server
- **Tailwind CSS 版本固定**：将 Tailwind 固定为 `tailwindcss@3`，修复 v4 中 `npx tailwindcss init -p` 在某些环境下报错 `could not determine executable to run` 的问题
- **Tailwind Content 配置自动补全**：脚手架自动检测并修复 `tailwind.config.js` 中的空 `content` 数组，设置为 Vite React TS 标准路径 `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`，消除构建警告

---

## v3.4.0 — IDE 无关化 (2026-04)

### Breaking Changes
- `scaffold_project.js`：移除对 `__dirname` 硬编码依赖，rootDir 通过 `--root` 或 `UPOWER_ROOT` 环境变量显式传入
- 模板路径不再假设 `.trae/scaffold/bin/` 目录结构

### New Features
- `upower.js`：统一 CLI 入口，支持 `scaffold` / `ask` / `assemble` 子命令
- Thin Adapter：为 Trae / OpenCode / Cursor / VSCode 提供独立适配器文件
- `--root` 参数：所有核心脚本支持显式路径注入
- `--upower-root` 参数：scaffold 脚本支持指定 UPower 框架根目录
- `findUpowerRoot()`：4 层 fallback 自动发现（`--upower-root` > `UPOWER_ROOT` env > Trae 路径 > v3.4 包路径）

### Migration Guide（从 v3.3 升级）
1. 替换 `project-manager/SKILL.md` — 使用 `adapters/<your_ide>/SKILL.md` 版本
2. 在项目根目录放置对应 IDE 的 adapter 文件（`.cursorrules` 或 `CLAUDE.md`）
3. 原有 `.trae/scaffold/bin/` 下的脚本保持向后兼容（位置参数仍支持）

### Bug Fixes
- 修复 OpenCode 环境下 `scaffold_project.js` 路径指向 `~/.config/` 的问题
- 修复 `ask_ai.js` 在非 Trae 环境下找不到 prompts 和 knowledgebase 的问题
- 修复 `assemble_system_prompt.js` 在非 Trae 环境下找不到 template 的问题
