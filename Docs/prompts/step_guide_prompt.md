# Figma Make 工作流标准提示词库 (Step Guide Prompts)

此文档对应 `step_by_step_forFM.md` 的工作流，为每一个 AI 生成步骤提供了标准化的 Prompt 模板。
**使用方法**：在执行每一步时，请将对应的 Prompt 发送给 AI 助手（如 Trae, ChatGPT, Claude），并附带所需的**输入文件**内容。

---

## 阶段二：需求清洗与品牌定调 (Refine & DNA)

### 1. 生成设计导向 PRD (Design-Oriented PRD)
*   **目标文件**: `input/prd(input).md`
*   **输入上下文**: `input/for_prd/` 文件夹下的所有原始素材（图片请描述或 OCR，文本直接粘贴），以及 `input/reference_webs.md`（如果存在）。
*   **Prompt**:
    ```markdown
    # Role
    你是一位拥有 10 年经验的“创意总监”兼“高级产品经理”。你擅长将枯燥的业务需求转化为极具张力的设计概念。

    # Context
    我将提供两个文件夹的内容作为输入：
    1.  `input/for_prd/`: 原始的业务需求、草图、会议记录。
    2.  `input/reference_webs.md`: 客户喜欢的参考网站和竞品链接。

    # Task
    请阅读上述材料，为项目 [项目名称] 撰写一份《设计导向 PRD (Design-Oriented PRD)》。

    # Requirements
    1.  **Anti-Generic AI (反通用感)**: 严禁使用“提升用户体验”、“简洁大方”等毫无意义的正确的废话。必须使用具体的、有情感色彩的词汇。
    2.  **Soul First (灵魂优先)**:
        *   结合 `reference_webs.md` 中的参考，提炼出它们共同的“气质”（例如：不仅是“深色模式”，而是“像夜航仪表盘一样的精密感”）。
        *   用一句话定义这个产品的“灵魂”。
    3.  **用户情绪旅程**: 描述用户在使用过程中的心理变化（例如：从“疑惑”到“掌控”再到“愉悦”）。
    4.  **关键功能的设计转译**: 不要只列功能点，要说明该功能在视觉和交互上应该传达什么感觉（例如：“库存列表不应只是表格，而应像机场航班显示屏一样传递实时紧迫感”）。
    5.  **视觉风格参考**: 推荐 3 个具体的视觉风格关键词（如 "Cyberpunk", "Swiss Style", "Neomorphism"）。

    # Output Format
    请以 Markdown 格式输出，包含以下章节：
    1. Executive Summary (含核心价值与参考站气质提炼)
    2. User Personas & Emotional Journey
    3. Key Features & Design Translation (功能 -> 视觉/交互隐喻)
    4. Strategic Positioning (From X To Y)
    ```

### 2. 生成品牌 DNA (Brand DNA)
*   **目标文件**: `input/brand_dna.md`
*   **输入上下文**: 刚刚生成的 `prd(input).md`。
*   **Prompt**:
    ```markdown
    # Role
    你是一位世界级的品牌设计师和视觉叙事专家。

    # Task
    基于提供的 PRD，为 [项目名称] 提炼“品牌 DNA”。这不仅仅是视觉规范，而是产品的“性格”和“物理属性”。

    # Requirements
    1.  **Physics Definition (物理定义)**:
        *   **Gravity (重力)**: 页面元素是漂浮的（零重力）还是沉稳的（高重力）？
        *   **Light (光影)**: 光源来自哪里？是自然柔光、霓虹点光，还是无影灯？
        *   **Material (材质)**: 核心材质是什么？（如：磨砂玻璃、阳极氧化铝、纸张）。
    2.  **拒绝抽象**: 不要说“科技感”，要说“像刚切开的铝合金边缘一样的冷冽金属感”。
    3.  **视觉隐喻 (Visual Metaphors)**: 找到一个现实世界中的物体或场景作为设计的核心隐喻（例如：太空舱仪表盘、深夜的便利店、老式打字机）。
    4.  **Prompt Cheat Sheet 映射**: 如果适用，请从 `Prompt_Cheat_Sheet.md` 中挑选最匹配的关键词（如 Spatial Tech Minimalism, Bento Grid 等）。

    # Output Format
    Markdown 格式，文件名 `brand_dna.md`。包含章节：
    1. Core Identity (含物理定义)
    2. Visual Metaphors
    3. Sensory Description (光/影/声/触)
    4. Design References Mapping
    ```

---

## 阶段三：核心资产生成 (Core Assets Generation)

### 1. 生成页面骨架 (The Skeleton)
*   **目标文件**: `skeleton_template.json`
*   **输入上下文**: `prd(input).md`。
*   **Prompt**:
    ```markdown
    # Role
    你是一位精通 Information Architecture (IA) 的 UI 架构师。

    # Task
    根据 PRD，设计 [项目名称] 首页的 JSON 骨架结构。

    # Requirements
    1.  输出纯 JSON 格式，不要 Markdown 包裹。
    2.  结构必须包含：`project_name`, `theme` (light/dark), `pages` 数组。
    3.  `pages` 中每个 `section` 必须有 `id`, `type` (如 hero, features, gallery), 和 `components` 列表。
    4.  组件命名要语义化且具体（如 `HeroTitle`, `InventoryGrid`, `TrustLogos`）。
    5.  确保逻辑流符合用户的浏览习惯（AIDA模型：Attention -> Interest -> Desire -> Action）。
    ```

### 2. 生成真实内容载荷 (The Payload)
*   **目标文件**: `web_content.js`
*   **输入上下文**: `prd(input).md`, `skeleton_template.json`。
*   **Prompt**:
    ```markdown
    # Role
    你是一位资深的 UX Copywriter (用户体验文案)。

    # Task
    基于 PRD 和 Skeleton，为 [项目名称] 撰写**真实**的页面填充内容 (Payload)。

    # Requirements
    1.  **Real Content Only**: 严禁使用 Lorem Ipsum。所有标题、副标题、按钮文案必须是真实的、有营销说服力的。
    2.  **Data Schema Match**: 输出内容必须严格匹配 Skeleton JSON 的结构。
    3.  **Tone & Voice**: 保持与 PRD 中定义的“品牌性格”一致（如：如果是赛博朋克风，文案要硬核、简洁）。
    4.  **Format**: 输出一个 JavaScript 对象导出 (export const content = { ... })。
    ```

### 3. 生成绘图提示词 (The Style Prompt)
*   **目标文件**: `style_prompt.md`
*   **输入上下文**: `brand_dna.md`。
*   **Prompt**:
    ```markdown
    # Role
    你是一位 AI 绘画大师 (Midjourney/Stable Diffusion Expert)。

    # Task
    基于 Brand DNA，编写用于生成网站配图或背景的 Prompt。

    # Requirements
    1.  **Subject**: 描述画面的主体（如：抽象的 3D 玻璃球体，或极简主义的办公桌）。
    2.  **Modifiers**: 添加材质、光照、渲染引擎关键词（如：Octane Render, Ray Tracing, 8k, Unreal Engine 5）。
    3.  **Color Palette**: 强调 DNA 中的配色。
    4.  **Aspect Ratio**: 设定合适的比例（如 --ar 16:9）。
    ```

### 4. 生成设计规范 (The Specs)
*   **目标文件**: `design_system_specs.md`
*   **输入上下文**: `brand_dna.md`。
*   **Prompt**:
    ```markdown
    # Role
    你是一位 Design Systems Lead (设计系统负责人)。

    # Task
    将 Brand DNA 转化为可执行的 CSS/Tailwind 规范。

    # Requirements
    1.  **Colors**: 定义主色、辅色、背景色、文本色的 Hex 值和 Tailwind 类名建议。
    2.  **Typography**: 推荐字体家族（Font Family）和字号阶梯（Type Scale）。
    3.  **Spacing**: 定义间距系统（4px grid）。
    4.  **Radius & Shadows**: 定义圆角和阴影的具体参数。
    5.  **Output**: Markdown 格式的 Design Token 列表。
    ```

### 5. 生成动画指南 (The Motion)
*   **目标文件**: `animation_prompts.md`
*   **输入上下文**: `brand_dna.md`。
*   **Prompt**:
    ```markdown
    # Role
    你是一位 Motion Designer (动效设计师)。

    # Task
    定义网站的动态交互行为。

    # Requirements
    1.  **Physics**: 定义运动曲线（Bezier Curve）和持续时间（Duration）。是弹性的（Spring）还是线性的（Linear）？
    2.  **Triggers**: 定义 hover, click, scroll 时的反馈。
    3.  **Choreography**: 元素入场是否需要交错（Stagger）？
    4.  **Framer Motion**: 如果可能，提供 Framer Motion 的伪代码参数。
    ```
