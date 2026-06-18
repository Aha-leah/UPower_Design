# Rules Directory

此目录用于存放**最高优先级**的项目约束（Red Lines）或偏好（Green Lights）。

## 作用机制
- 此目录下的所有 `.md` 文件会被 AI Agent 在执行任务前自动读取。
- **优先级**: 高于 System Prompt，高于具体 Skill 的指令。
- **用途**:
  - **Red Lines (红线)**: 绝对禁止做的事情（例如：“禁止使用 class 组件”、“禁止使用未经允许的第三方库”）。
  - **Green Lights (绿灯)**: 强烈建议或默认的偏好（例如：“总是优先使用 TypeScript”、“默认开启深色模式”）。

## 使用示例
新建 `coding_standards.md`:
```markdown
# Coding Standards
1. 禁止使用 `any` 类型。
2. 所有组件必须导出为 Named Export。
```
