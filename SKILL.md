---
name: project-analyzer-skills
license: MIT
github: https://github.com/zhangclaus/project-analyzer-skills
description:
  分析任何代码库，回答三个核心问题：做了什么、流程什么样、创新在哪。
  生成结构化报告 + 交互式架构浏览器。
  触发场景：用户想理解、分析或文档化一个项目，如 "分析这个项目"、"帮我理解这个代码库"、
  "generate architecture diagram"、"explain how this project works"、"项目详解"、
  "codebase overview"、"project deep dive"，或用户提供 GitHub URL / 本地路径并询问其结构。
metadata:
  author: zhangclaus
  version: "2.0.0"
---

# Project Analysis

分析任何代码库，回答三个核心问题：
1. **做了什么** — 解决什么问题，核心功能
2. **流程什么样** — 主流程怎么跑的
3. **创新在哪** — 设计上有什么不同

## Input Handling

**Local path:** `Glob` 验证目录存在 → 不存在则提示用户。
**GitHub URL:** `gh repo view` 验证 → `gh repo clone` 到 `/tmp/project-analyzer-skills-<repo>`。

## Quick Scan

1. `Glob` 获取目录结构（前2-3层）
2. `Read` 配置文件检测技术栈（package.json, Cargo.toml, go.mod 等）
3. `Read` README 获取项目描述
4. `Read` 主入口文件了解项目类型
5. `Glob` 统计源文件数量

展示摘要，询问报告语言（中文/English，默认匹配项目主语言）。

## Analysis

三个问题按顺序处理，每个建立在前一个之上。

### Q1: What does it do?

1. `Read` README/文档/入口文件理解问题域
2. **项目定位** — 回答"它是什么？怎么用？":
   - 类别（library/CLI/framework/service/SDK/plugin/platform）
   - 形态（npm包/Docker镜像/SaaS/二进制）
   - 交互方式（API/CLI/GUI/SDK import/MCP protocol）
   - **集成模型**: active call（用户直接调用）vs passive trigger（hooks/plugins/middleware）
     - `Grep` 搜索 hook 注册、plugin 挂载、事件监听、middleware 链
     - passive trigger: 列出所有触发点及其时机和作用
   - 写一行定位语句: "<Name> is a <category> that <what it does> for <who>"
3. `Grep` 导出的函数/类/API → 核心能力
4. `Glob` 源码目录 → 模块边界
5. 对每个主要模块: `Read` 入口文件, `Grep` 导出, 推断 WHY。标记 layer（`access`/`business`/`tool`/`data`/`infra`）
6. `Grep` import 模式 → 跨模块依赖
7. **模块分组为子系统（8-12组）:**
   - 按功能域分组，不是按 layer
   - 每个子系统: `id`(snake_case), `name`(中文/显示名), `icon`(emoji), `color`(hex), `desc`(一句话), `modules`
   - 名称必须可读（如"对抗引擎"，不是"adversarial_engine"）
8. **提取每个子系统的内部流程和关键细节:**
   - `Read` 子系统核心模块代码理解其流程
   - `flow`: 有序步骤列表，每步 `name`(中文), `module`, `desc`(一句话)
   - `key_details`: 学习者必须知道的重要事实（阈值、算法、默认值等）
   - **关键: 所有细节必须来自实际代码，不可捏造**
9. **提取3-5个核心概念（领域模型）:**
   - 项目围绕的关键抽象（如 Crew, Worker, Turn）
   - 每个: `name`(中文), `what`(一句话), `why`(一句话)

**Layer 规则:**
- 导出路由/CLI命令 → `access`
- 有业务逻辑但无框架导入 → `business`
- 纯函数/类型定义 → `tool`
- 导入ORM/数据库做CRUD → `data`
- 配置/日志/事件/进程管理 → `infra`

### Q2: How does it work?

1. **追踪工作流**（用 Q1 的集成模型决定方式）:
   - active call: 从主入口追踪调用链
   - passive trigger: 追踪每个 trigger 的流程 + 生命周期时序
2. 记录每步: 发生了什么、在哪个模块、分支、副作用
3. 识别关键路径（happy path）

**找主流:** 最显眼的CLI命令/API端点 / README主用例 / 被引用最多的函数 / hook注册文件。

### Q3: What's innovative?

1. 识别架构模式（单体/微服务/事件驱动/插件系统）
2. 找非常规设计决策: `Grep` 搜索 Mixin/decorator/metaclass 等模式
3. 与同领域常见模式对比
4. 检查技术选型: 并发模型、状态管理、扩展机制
5. `Read` 设计文档/ADR（如存在）

**输出:** 3-5个创新点，每个解释 WHY 和好处，不要只列功能。

## Output

生成一个报告 + 一个交互式 HTML 文件。所有文本内容使用 Quick Scan 选定的语言。

**报告和 HTML 生成细节见:** `templates/output-reference.md`

Before writing output, delete existing files: `rm -rf docs/analysis/<project-name>/*`

After generating: 展示报告摘要，让用户打开 HTML 交互探索，询问是否需要调整。
