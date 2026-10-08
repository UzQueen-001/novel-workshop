# 小说工坊 · Novel Workshop

面向长篇创作的 Codex 插件集。

一句话：**一台由作者掌闸的自动生成系统。**
生成全自动——排骨架、写正文、跑模块检查、渲染总览、回填台账与游标，都不用作者动手；
判断权留在人手上——设定与骨架要作者点头，章节由作者切，这一轮写多长由作者发话，不可逆的情节动笔前先报备。
它不是黑箱，也不是只给建议的助手：它能一路写下去，但每一个会改变作品的岔路口都停给人。

长篇的难处不在单章写得好看，而在连续几十章之后设定不崩、人物不走形、节奏不塌。
本仓库提供的两个插件，都在处理同一件事：**把不可复盘的成稿，换成可检查、可追溯的工序。**

许可 MIT ｜ 市场来源 `UzQueen-001/novel-workshop`

## 插件一览

| 插件 | 状态 | 定位 |
| --- | --- | --- |
| [`novel-blocks`](plugins/novel-blocks) | **当前主线** | 模块化写作：一条写作顺序的骨架、一块一个文件的档案、每个模块配检查器 |
| [`novel-workshop`](plugins/novel-workshop) | 早期版本 | 双管线独立生成、交叉重组、盲评加权投票，逐章收敛出终稿 |

两者不共用数据格式。新项目用 `novel-blocks`；已经在 `novel-workshop` 体系里开写的项目可以按原法收尾。

---

# 一、novel-blocks · 模块化写作

## 概述

把一部长篇拆成骨架、角色、线索、场景、关系、世界观几个模块，每个模块由大量小块（积木）组成，**一块一个文件**。
写作时只加载当前用得着的那几块——这是为长上下文设计的：不靠模型记住整本书，靠文件把该记的事记在外面。

它不做黑箱：**生成是自动的，判断不是。** 设定靠问，骨架靠作者点头，正文照骨架持续写。

## 自动化到什么程度

| 环节 | 谁做 |
| --- | --- |
| 排骨架（含节奏评分、线索落点、影响面分流） | 自动 |
| 写正文（照骨架持续生成） | 自动 |
| 跑模块检查、出报警 | 自动 |
| 渲染骨架总览、回填台账与游标 | 自动 |
| 点头：设定与骨架 | **作者** |
| 划章 | **作者** |
| 发话这一轮写多少（如「继续写 3000 字」） | **作者** |
| 批不可逆情节（死亡、黑化、势力覆灭） | **作者** |

**还差的一环是循环控制。** 什么时候该继续写、什么时候该停、什么时候该发现写不通了回退到某个块——
这三件事目前仍由作者判断并发令。要让循环自己转，先得定下这套判断交给谁、出错时报警给谁。

## 核心设计

**骨架是一条写作顺序的直线。** 块按 `B01`、`B02`、`B03` 一路往下排，编号本身就是写作顺序。
线（视角）只是块上的一个字段：换线＝换一双眼睛，回到过去＝这一块去写更早的时间，
两者都**不改变**写作顺序这件事，也不允许摆成并排的泳道。
这条是硬规则——同时发生的事一旦排成两条并排轨道，下一块该写哪里就分不清了。

**一块一个文件。** 设定、骨架、台账一律 `.md`，一块一个小文件，一个模块就是一个文件集群，避免长文档的打开与检索开销；小说正文一律 `.txt`。

**角色门禁。** 新角色必须先立卡才能进剧情。正式角色六块必填——名字、定位、来历、能力或手段、底线、当前目标；
无名角色五块以内、登记不立卡，一旦第二次出现或被点名，必须升级为正式角色。

**线索一入一出。** 线索诞生的那一刻，它的落点、以及落点前后各一块，必须已经存在于骨架里。
出口没规划出来的线索不允许存在——这条规则把「以后再说」从流程里删掉了。落点在很远处时打 `🕳远端` 标记。

**因果链接改写。** 改角色不是改文字，而是在某个骨架块上挂一个因果节点，声明某项属性自此改变。
角色的每个字段因此是「基础值＋变更链」，检查器按块取当时生效的那一版。
改写**不得落在已经写完的正文里**——撞上已写区域时停下来问作者，否则已写出的字与检查结果会对不上。

**节奏评分决定字数。** 每块打三个分：内容重要性、情绪塑造（紧张／平缓／悲伤／快乐）、与前后块的咬合，
加权后映射到 10–1000 字。骨架一边往前排，一边算这段的预估字数。

**＋20k 前瞻。** 写作位置之后的块，预估字数累计 ≥ 20000 才允许动笔。只能多，不能少；
为一条精妙的伏笔提前把某段做长做细，正是允许的用法。

**模块检查器。** 每个模块配一个独立检查器：角色查 OOC 与认知越界，世界观查硬规则与术语口径，
线索查有入无出，场景查空间描述是否打架，关系查状态是否与记录不符。填完一段血肉就跑一遍。
需要说明的是，检查器**只能发现「和记录冲突」，发现不了「记录里根本没写」**——它的有效性上限就是台账的完整度。

## 骨架渲染

插件带一个只读渲染脚本，把项目渲染成单文件 HTML 总览：**行＝线**，横轴两选一——
「按写作顺序」看顺序与换线，「按故事时间」看回到过去的块往左挪。
方块宽度正比于预估字数，所以图上的疏密就是节奏；每条线索画成一条弧线，
**弧线中点的小方块可以点开那条线索**，方块本身点开就是对应的 md。

```sh
node scripts/viz.mjs <项目目录> [--open]   # 输出 <项目目录>/骨架总览.html
node scripts/init-project.mjs <项目目录>    # 新建一个空项目骨架
```

渲染器从不写回任何文件：改内容永远改 md，图只是读出来的。

## 目录结构

```text
《项目名》/
├── 骨架/     线索引.md、写作顺序.md、块/B01_*.md
├── 角色/     <名字>/{卡.md, 积木/, 认知边界.md, 变更/}
├── 场景/     地点索引.md、<地点>.md
├── 关系/     <A>_对_<B>.md      A 对 B 与 B 对 A 各存一条，不合并
├── 线索/     C01_*.md
├── 世界观/   规则/、术语表.md、禁忌.md、待解决问题.md
├── 正文/     第01章.txt
└── _检索/    作者决定.md、待办队列.md
```

## 技能与脚本

| 名称 | 职责 |
| --- | --- |
| `novel-blocks` | 唯一入口。铁律、写作循环、检查触发点，按需路由到下面的参考文档 |
| `references/` | 十个模块规范：骨架、角色、线索、场景、关系、世界观、检查、可视化、命名、总纲 |
| `scripts/viz.mjs` | 骨架渲染 |
| `scripts/init-project.mjs` | 新建项目骨架 |

## 状态与限制

- 规范与渲染器已定稿并跑通，**尚未用一部长篇做过端到端实跑**。
- 检查器目前是写死的判定清单与输出格式，由 agent 按流程执行，**不是可独立运行的脚本**。
- 绝对时间依赖世界观模块里定的纪年法；渲染排序暂用一个数字「时间位」，纪年法固定后可由时间字符串直接推导。
- **循环控制未设计**：继续、暂停、回退这三件事现在由作者发令，自动化尚未闭环。

---

# 二、novel-workshop · 双管线生成（早期版本）

以结构化片段为最小比较单位，通过双管线独立生成、交叉重组与盲评加权投票，逐章收敛出终稿。
版本 0.1.5，保留用于已在旧体系里开写的项目。

## 核心机制

**三级片段结构。** 每章内容分解为三类可独立比较的片段：骨架（事件）、软骨（节点之间的过渡与承接）、血肉（环境、动作、细节、心理）。三者不合并，投票与拼接按类型分别进行。

**骨架是硬边界。** 两条管线只允许为骨架增加厚度，不允许引入骨架之外的事件、人物、地点、设定或情报。判定方式：抽掉全部描写与维度之后，正文的事件序列必须与骨架逐节点一致。

**双管线独立生成。** 升维管线自骨架直接展开正文，逐层叠加空间、人物、关系与语言维度。降维管线将章节转换为脚本形态，再逐级复原为正文。管线运行期间不读取另一条管线的任何文本。

**交叉重组。** 两版成品各自拆解后交换骨架，再各写一遍，得到四个版本。四个版本按片段类型对齐，每一类各自产生四个候选。

**盲评加权投票。** 候选片段去掉来源标识、打乱顺序后交由互盲评审 agent 打分，覆盖八个维度，加权求和后逐段选取最优，拼成缝合稿；缝合稿回注入两条管线各修饰一版，二次投票定稿。

**评分台账。** 两条管线在每个步骤的维度得分与加权总分全部记录在册，支持跨章比较，用于判断管线强弱与回归验证。

## 管线架构

```text
开场
  └─ 引导 → 筹备 → 升维解剖（脊椎 → 幼态骨架 → 节奏测试 → 成熟骨架）
        ↓
   成熟骨架 ─┬→ 升维管线 → 产品1 ─┐
             └→ 降维管线 → 产品2 ─┤
                                   ├→ 校准（越界 / 禁忌 / 自洽）
                                   ↓
                          交叉重组：拆2注入1 = 产品3，拆1注入2 = 产品4
                                   ↓
                          校准 → 四份拆解 → 逐段盲评加权投票
                                   ↓
                                缝合稿
                                   ↓
                回注入两条管线 → 二次投票 → 终稿 → 章后收尾
```

降维管线为主体，五道工序依次为：对白剧本（仅对话，不限字数）→ 主剧本（补动作与行为）→ 场景化剧本（补布景与运镜）→ 定原文（去括号，补环境与细节描写）→ 成文（仅调整词汇与语序）。每道工序之间执行一次逻辑与设定校准。

设计前提：脚本化表达更贴近模型的强项。作者的经验观察是 DeepSeek 在剧本写作上表现较好，因此将章节先转换为脚本形态再升回小说。该判断为经验性结论，非基准测试结果，更换模型时建议复测。

## 技能目录

| 技能 | 职责 |
| --- | --- |
| `novel-start` | 开场：介绍工作流与授权点 |
| `novel-onboarding` | 引导工作流：启发式提问采集设定，建立工作目录 |
| `novel-prep` | 筹备工作流：台账、逻辑连接、参照作品、文风样本 |
| `novel-anatomy` | 升维解剖（2ex）：脊椎 → 幼态骨架 → 节奏测试 → 成熟骨架 |
| `novel-ascend` | 升维管线 |
| `novel-descend` | 降维管线 |
| `novel-calibrate` | 校准：越界与禁忌判定，退回重造 |
| `novel-dissect` | 拆解：将成品还原为骨架／软骨／血肉 |
| `novel-ai-judge` | AI 痕迹判定 agent：一人一特征，只判不改 |
| `novel-deai` | 去 AI 味改写 agent：按命中清单改写，一次一个特征 |
| `novel-vote` | 盲评加权投票与评分台账 |
| `novel-logic` | 逻辑审查：四类互悖与六项必查 |
| `novel-closeout` | 章后收尾：回填台账、汇总评分 |
| `novel-panel` | 评审团编制：各 agent 的角色、输入输出与互盲规则 |
| `novel-pipeline` | 整体工序编排 |
| `novel-taboo` | 写作禁忌：把作者不能碰的线落成硬约束 |

## 工作区结构

工作区内的全部文件均为 `.txt`。正文单章数千字，叠加解剖稿与台账后，Markdown 渲染会造成明显卡顿；纯文本在打开与检索上开销更低。技能清单文件为 `.md`，由平台规范决定。

```text
<作品目录>/
├── 00_台账/    提问台账、待解决问题、伏笔账本、禁忌、评分台账、评审维度与权重
├── 01_世界/    世界观、总体矛盾
├── 02_人物/    人物卡、角色状态
├── 03_规划/    长线计划
├── 04_章节/    逐章产物（骨架、双管线正文、交叉稿、解剖、缝合稿、终稿）
└── 05_文风/    文风样本、参照书目、参照段落
```

Obsidian 为可选。仅在检测到本机已安装时询问是否以其建立工作区；未安装时不作提示，流程不依赖任何 Obsidian 功能。因工作区文件为 `.txt`，不使用 Obsidian 双链语法。

## 设计约束

- **信息守恒** —— 改写不得新增或删减事实、数字、日期、引语、来源、因果与限定词。改写后每个实词均可在原文中指出出处。
- **白名单改写** —— 去 AI 味仅处理特征清单列出的形态，未命中处逐字保留；清单同时包含一份反向表，列明实测不支持、不得据以修改的特征。
- **职责分离** —— 判定与改写分属不同 agent；同一特征下，判定者与改写者不得为同一 agent。
- **互盲** —— 评审 agent 之间不交换分数与评语，候选片段去除来源标识；结果收齐后统一汇总。
- **授权点** —— 新建目录、工作区外写入、联网检索、每一层设定、骨架确认与不可逆情节，均先取得作者确认。

## 状态与限制

- 全部技能已通过结构校验与插件清单校验；**尚未完成端到端实跑验证**，规则在实际执行中出现未覆盖分支属预期情况。
- 两条管线当前串行执行。串行仅为资源考量，两轮输入与规则不变，执行顺序不影响可比性。
- 上游规则清单中，AI 痕迹特征的实测数据来自第三方语料研究，本仓库未独立复现。

---

# 安装

从 Git 市场安装：

```sh
codex plugin marketplace add UzQueen-001/novel-workshop
codex plugin add novel-blocks@novel-local      # 主线
codex plugin add novel-workshop@novel-local    # 早期版本，按需
```

从本地路径安装：

```sh
codex plugin marketplace add /path/to/novel-workshop
codex plugin add novel-blocks@novel-local
```

# 仓库结构

```text
.
├── .agents/plugins/marketplace.json   市场定义（市场名 novel-local）
├── plugins/novel-blocks/              主线插件：skills/ references/ scripts/
├── plugins/novel-workshop/            早期插件：skills/
└── LICENSE
```

# 第三方与许可

`novel-ai-judge` 与 `novel-deai` 使用的规则形态与实测结论取自公开语料研究项目 **lieflat-less-ai-tone**（作者 larashero3-dotcom），MIT License，Copyright (c) 2026 shiujan。该项目以 5 个模型 300 篇 AI 文本（117.9 万汉字）对照 329 篇人类文章（164.8 万汉字），逐条给出倍率、被推翻的预设与测量脚本。

- 项目地址：https://github.com/larashero3-dotcom/lieflat-less-ai-tone
- 本仓库在其结论基础上重写规则，并按骨架／软骨／血肉结构做了取舍。倍率、脚本与完整反例以原项目为准。

本仓库以 MIT License 发布，Copyright (c) 2026 UzQueen-001，见 [LICENSE](LICENSE)。

---

# Novel Workshop

A collection of Codex plugins for long-form fiction.

In one line: **an automatic generation system with the author on the gates.**
Generation is automatic — laying out the skeleton, writing prose, running the module checkers, rendering the overview, updating ledgers and cursors.
Judgement stays with the author — setting and skeleton need a nod, chapters are cut by the author, how much to write this round is the author's call, and irreversible plot moves are cleared beforehand.
It is neither a black box nor an advisor: it will keep writing, but every fork that changes the work stops for a human.

The hard part of a long novel is not one good chapter — it is keeping setting, characters and pacing intact across dozens of them. Both plugins here address the same problem: **replacing an un-auditable finished draft with steps that can be inspected and traced.**

License MIT ｜ Marketplace source `UzQueen-001/novel-workshop`

## Plugins

| Plugin | Status | Purpose |
| --- | --- | --- |
| [`novel-blocks`](plugins/novel-blocks) | **Current** | Module-based writing: one writing-order skeleton, one file per block, a checker per module |
| [`novel-workshop`](plugins/novel-workshop) | Legacy | Two independent drafting pipelines, cross-recombination, weighted blind review |

The two do not share a data format. Use `novel-blocks` for new projects; projects already written under `novel-workshop` can be finished with the original method.

---

# 1. novel-blocks

## Overview

A novel is decomposed into modules — skeleton, characters, threads, locations, relationships, world — and each module is a cluster of small blocks, **one file per block**. Only the blocks currently in use are loaded. This is a design for long context: the model is not asked to remember the whole book; the files remember it.

It is not a black box: **generation is automatic, judgement is not.** The setting is captured by questioning, the skeleton is confirmed by the author, and the prose is written continuously against the skeleton.

## How automated

| Step | Who |
| --- | --- |
| Skeleton layout (rhythm scoring, thread landings, impact routing) | automatic |
| Prose (continuous generation against the skeleton) | automatic |
| Module checkers and alerts | automatic |
| Skeleton overview rendering, ledger and cursor updates | automatic |
| Approving setting and skeleton | **author** |
| Cutting chapters | **author** |
| How much to write this round (e.g. "write another 3,000") | **author** |
| Clearing irreversible plot moves | **author** |

**Loop control is the missing piece.** When to continue, when to stop, and when to fall back after hitting a dead end are still the author's calls. Closing that loop first requires deciding who makes those calls and who gets alerted when something goes wrong.

## Design

**The skeleton is a single writing-order line.** Blocks run `B01`, `B02`, `B03` — the number *is* the writing order. POV ("line") is just a field on a block: switching POV swaps whose eyes you borrow, and going back in time means this block narrates an earlier moment. Neither changes the writing order, and simultaneous events are **never** drawn as parallel lanes — once they are, the next block to write becomes ambiguous.

**One file per block.** Setting, skeleton and ledgers are `.md`, one small file per block, so a module is a file cluster rather than a document that stalls on open; finished prose is `.txt`.

**Character gate.** A new character must be fully created before entering the plot. A formal character needs six required blocks — name, role, origin, ability or method, limits, current goal. A nameless walk-on gets at most five and is not carded; the moment it appears twice or is named, it must be upgraded.

**Threads are one-in, one-out.** The moment a thread is created, its landing point and the blocks immediately before and after it must already exist in the skeleton. A thread whose exit is unplanned is not allowed to exist — the rule removes "we'll figure it out later" from the process. Far-off landings are tagged `🕳`.

**Rewrites are causal links.** Changing a character is not editing text: it attaches a causal node to a skeleton block declaring that a trait changes from there on. Every field is therefore "base value + change chain", and checkers read the value in effect at that block. A rewrite **may not land inside already-written prose** — when it would, stop and ask the author.

**Rhythm scoring sets length.** Each block is scored on importance, emotional register and how tightly it interlocks with its neighbours; the weighted score maps to 10–1000 characters. The skeleton is scored as it is laid out.

**The +20k look-ahead.** Blocks after the writing position must total at least 20,000 estimated characters before drafting continues. More is allowed — deliberately lengthening a stretch to plant a foreshadow is the intended use.

**A checker per module.** Characters (OOC, knowledge boundary), world (hard rules, terminology), threads (dangling exits), locations (contradictory geography), relationships (state drift). They run after each prose pass. Note the ceiling: a checker can only find **conflicts with what is recorded** — never **what was never recorded**.

## Skeleton rendering

A read-only script renders the project into a single HTML overview: **rows are lines**, and the horizontal axis toggles between writing order and story time — so a block that goes back in time visibly moves left. Block width is proportional to estimated length, so the spacing *is* the rhythm. Each thread is drawn as an arc whose midpoint is clickable; each block opens its own `.md`.

```sh
node scripts/viz.mjs <project> [--open]   # writes <project>/骨架总览.html
node scripts/init-project.mjs <project>   # scaffold an empty project
```

The renderer never writes back: content is edited in the files, and the diagram is only a reading of them.

## Layout

```text
<project>/
├── 骨架/     line index, writing-order table, blocks/B01_*.md
├── 角色/     <name>/{card.md, blocks/, knowledge-boundary.md, changes/}
├── 场景/     location index and cards
├── 关系/     <A>_to_<B>.md      A→B and B→A stored separately
├── 线索/     threads
├── 世界观/   rules, glossary, taboos, open questions
├── 正文/     chapter text (.txt)
└── _检索/    author decisions, task queues
```

## Status and Limitations

- Specification and renderer are settled and working; **not yet exercised end-to-end on a full novel**.
- Checkers are currently a written rubric and output format executed by the agent, **not standalone scripts**.
- Absolute time depends on the calendar defined by the world module; ordering currently uses a numeric time key.
- **Loop control is undesigned**: continue, pause and roll back are author commands today, so automation does not yet close the loop.

---

# 2. novel-workshop (legacy)

Structured segments serve as the minimum unit of comparison; two independent drafting pipelines, cross-recombination and weighted blind review converge each chapter into a final text. Version 0.1.5.

**Three segment types.** Chapter content is decomposed into skeleton (events), cartilage (transitions between nodes) and flesh (setting, action, detail, psychology). The three are never merged; voting and assembly are performed per type.

**The skeleton is a hard boundary.** Both pipelines may only add thickness to the skeleton, never events, characters, locations, settings or information outside it. Test: strip every description — the event sequence must match the skeleton node for node.

**Two independent pipelines.** The ascending pipeline expands prose directly from the skeleton, layering space, character, relationship and language. The descending pipeline converts the chapter into script form and progressively restores it to prose. Neither reads the other's text while running.

**Cross-recombination.** Both drafts are dissected and their skeletons exchanged, producing four versions. Aligned by segment type, each type yields four candidates.

**Weighted blind review.** Candidates are stripped of source labels and shuffled before blind reviewers score them across eight dimensions; weighted totals select the best segment of each type.

**Score ledger.** Dimension scores and weighted totals for each pipeline at each step are recorded, enabling cross-chapter comparison and regression checks.

```text
Opening → Onboarding → Preparation → Anatomy (spine → juvenile skeleton → rhythm test → mature skeleton)
   ↓
   ─┬→ Ascending pipeline → Product 1 ─┐
    └→ Descending pipeline → Product 2 ─┤→ Calibration
                                        ↓
              Cross-recombination → Calibration → Four dissections → per-segment blind review
                                        ↓
                    Stitched draft → re-inject into both pipelines → second vote → final text
```

The descending pipeline is the main body: dialogue script → action script → staged script → draft → final wording, with a logic and continuity calibration between consecutive steps.

Skills: `novel-start`, `novel-onboarding`, `novel-prep`, `novel-anatomy`, `novel-ascend`, `novel-descend`, `novel-calibrate`, `novel-dissect`, `novel-ai-judge`, `novel-deai`, `novel-vote`, `novel-logic`, `novel-closeout`, `novel-panel`, `novel-pipeline`, `novel-taboo`.

Workspace files are all `.txt` (a chapter plus its dissection drafts and ledgers makes Markdown rendering stall); skill manifests remain `.md`. Obsidian is optional and never required.

## Install

```sh
codex plugin marketplace add UzQueen-001/novel-workshop
codex plugin add novel-blocks@novel-local      # current
codex plugin add novel-workshop@novel-local    # legacy, optional
```

## Credits and License

The rules used by `novel-ai-judge` and `novel-deai` are based on the open corpus study **lieflat-less-ai-tone** by larashero3-dotcom (MIT License, Copyright (c) 2026 shiujan). That project compares 300 AI-written texts (1.18M Chinese characters, 5 models) against 329 human articles (1.65M characters) and reports per-rule ratios, retracted hypotheses and measurement scripts.

- Repository: https://github.com/larashero3-dotcom/lieflat-less-ai-tone
- This repository rewrites those findings for its skeleton / cartilage / flesh structure. For ratios, scripts and full counter-examples, refer to the original project.

This repository is released under the MIT License, Copyright (c) 2026 UzQueen-001. See [LICENSE](LICENSE).
