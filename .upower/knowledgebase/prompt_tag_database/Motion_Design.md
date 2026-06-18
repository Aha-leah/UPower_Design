# Motion Design Prompt Tags (2025+ Edition)
<!-- 动效设计标签库 -->

此文档用于在生成 Motion Guide 时提供物理规则和编排逻辑的参考。

| Category | Keywords | Description / Physics |
| :--- | :--- | :--- |
| **Motion Personality (动效性格)** | **Fluid & Organic** | 像水一样流动。无缝变形 (Morphing)，柔和的弹簧 (Soft Spring)，无生硬的开始结束。 |
| | **Snappy & Precise** | 像机械开关。极快响应 (Duration < 150ms)，高阻尼，强调确认感。 |
| | **Cinematic & Slow** | 像电影运镜。缓慢优雅 (Duration > 600ms)，使用 Ease-in-out，用于展示高贵感。 |
| | **Playful & Bouncy** | 像果冻。低阻尼，明显的过冲 (Overshoot) 和回弹，增加趣味性。 |
| | **Glitch & Tech** | 像信号干扰。瞬间切换，随机帧跳动，RGB 色散效果。 |
| **Physics (物理模型)** | **Spring (Stiff)** | `stiffness: 300, damping: 30` - 紧绷的弹簧，快速归位，无回弹。 |
| | **Spring (Wobbly)** | `stiffness: 120, damping: 10` - 松软的弹簧，明显摆动。 |
| | **Ease (Expo)** | `cubic-bezier(0.19, 1, 0.22, 1)` - 极速冲刺后缓慢刹车，现代感强。 |
| | **Linear** | 匀速。仅用于循环动画 (Spinners, Marquees)。 |
| **Choreography (编排模式)** | **Staggered Reveal** | 交错揭示。列表项按顺序延迟出现 (e.g., delay 0.05s per item)。 |
| | **Masked Text** | 蒙版文字。文字从下方被切掉的区域升起 (Translate Y + Opacity)。 |
| | **Shared Layout (Magic Motion)** | 共享布局。元素在页面切换时直接飞入新位置，无缝衔接。 |
| | **Parallax Scroll** | 视差滚动。背景移动速度慢于前景，创造深度感。 |
| | **Scrollytelling** | 滚动叙事。动画进度严格绑定滚动条位置，可回退。 |
| **Micro-Interactions (微交互)** | **Scale on Press** | 按下缩小。`scale: 0.95`，模拟物理按键下沉。 |
| | **Magnetic Hover** | 磁性悬停。按钮跟随鼠标微弱移动，像被磁铁吸引。 |
| | **Border Beam** | 边框流光。光线沿着卡片边缘流动。 |
| | **Cursor Follower** | 光标跟随。跟随鼠标的大圆圈或聚光灯效果。 |
