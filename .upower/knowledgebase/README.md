# Knowledge Base Directory

此目录用于存放项目的基础规范、模版和参考资料。

## 作用机制
- 此目录下的 `.md` 文件会被 AI Agent 视作“参考资料”或“知识库”。
- **优先级**: 低于 Rules，作为补充上下文存在。
- **用途**:
  - **Templates**: PRD 模版、设计规范模版。
  - **Standards**: 现有的 Design System 说明、API 接口文档。
  - **Context**: 业务背景介绍、术语表。

## 区别
- 如果是**必须遵守**的约束，请放 `.trae/rules`。
- 如果是**参考信息**或**样板**，请放此处。
