# 小说工坊 · Novel Workshop

面向长篇创作的 Codex 插件。以结构化片段为最小比较单位，通过双管线独立生成、交叉重组与盲评加权投票，逐章收敛出终稿。

版本 0.1.5 ｜ 许可 MIT ｜ 市场来源 `UzQueen-001/novel-workshop`

## 概述

长篇创作的困难不在单章写得好看，而在连续几十章之后设定不崩、人物不走形、节奏不塌。本插件把一章拆成可独立比较、可回溯、可评分的工序，让每一步的产物都能被检查，而不是只留下一份无法复盘的成稿。

它不做一键生成：设定由提问采集，骨架经作者确认，正文由两条互不相干的管线各写一版，再拆解、交换、逐段投票。

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

## 安装

从 Git 市场安装：

```sh
codex plugin marketplace add UzQueen-001/novel-workshop
codex plugin add novel-workshop@novel-local
```

从本地路径安装：

```sh
codex plugin marketplace add /path/to/novel-workshop
codex plugin add novel-workshop@novel-local
```

## 快速开始

直接唤起插件即可，无需准备输入：插件会先介绍工作流与需要授权的环节，再询问从哪一步开始。

已有设定与人物时，可从筹备工作流介入；已有大纲、需要推进某一章时，从升维解剖介入；只想清理某段文字的 AI 痕迹时，单独调用判定与改写技能。

开场不是必须当场作答的选择题：看完介绍再提写作要求即可，插件按你下一条消息的内容决定入口。技能库的改动对之后的输入生效。

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

## 第三方与许可

`novel-ai-judge` 与 `novel-deai` 使用的规则形态与实测结论取自公开语料研究项目 **lieflat-less-ai-tone**（作者 larashero3-dotcom），MIT License，Copyright (c) 2026 shiujan。该项目以 5 个模型 300 篇 AI 文本（117.9 万汉字）对照 329 篇人类文章（164.8 万汉字），逐条给出倍率、被推翻的预设与测量脚本。

- 项目地址：https://github.com/larashero3-dotcom/lieflat-less-ai-tone
- 本仓库在其结论基础上重写规则，并按骨架／软骨／血肉结构做了取舍。倍率、脚本与完整反例以原项目为准。

本仓库以 MIT License 发布，Copyright (c) 2026 UzQueen-001，见 [LICENSE](LICENSE)。

---

# Novel Workshop

A Codex plugin for long-form fiction. Structured segments serve as the minimum unit of comparison; two independent drafting pipelines, cross-recombination, and weighted blind review converge each chapter into a final text.

Version 0.1.5 ｜ License MIT ｜ Marketplace source `UzQueen-001/novel-workshop`

## Overview

The hard part of long-form fiction is not writing one good chapter — it is keeping the setting, characters and pacing intact across dozens of them. This plugin decomposes a chapter into steps that can be inspected, traced and scored, so every artifact is checkable instead of leaving behind a single draft that cannot be audited.

It is not a one-click generator: the setting is captured by questioning, the skeleton is confirmed by the author, and the prose is written twice by two independent pipelines before being dissected, exchanged and voted on segment by segment.

## Core Mechanism

**Three segment types.** Chapter content is decomposed into skeleton (events), cartilage (transitions between nodes) and flesh (setting, action, detail, psychology). The three are never merged; voting and assembly are performed per type.

**The skeleton is a hard boundary.** Both pipelines may only add thickness to the skeleton, never events, characters, locations, settings or information outside it. Test: strip every description and dimension — the event sequence must match the skeleton node for node.

**Two independent pipelines.** The ascending pipeline expands prose directly from the skeleton, layering space, character, relationship and language. The descending pipeline converts the chapter into script form and then progressively restores it to prose. Neither reads the other's text while running.

**Cross-recombination.** Both drafts are dissected and their skeletons exchanged, producing four versions. Aligned by segment type, each type yields four candidates.

**Weighted blind review.** Candidates are stripped of source labels and shuffled before blind reviewers score them across eight dimensions. Weighted totals select the best segment of each type, assembled into a stitched draft that is re-injected into both pipelines and decided by a second vote.

**Score ledger.** Dimension scores and weighted totals for each pipeline at each step are recorded, enabling cross-chapter comparison, pipeline benchmarking and regression checks.

## Pipeline Architecture

```text
Opening
  └─ Onboarding → Preparation → Anatomy (spine → juvenile skeleton → rhythm test → mature skeleton)
        ↓
   Mature skeleton ─┬→ Ascending pipeline → Product 1 ─┐
                    └→ Descending pipeline → Product 2 ─┤
                                                        ├→ Calibration (boundary / taboo / continuity)
                                                        ↓
                                    Cross-recombination: dissect 2 into 1 = Product 3, dissect 1 into 2 = Product 4
                                                        ↓
                                    Calibration → Four dissections → per-segment weighted blind review
                                                        ↓
                                                  Stitched draft
                                                        ↓
                              Re-inject into both pipelines → second vote → final text → close-out
```

The descending pipeline is the main body, in five steps: dialogue script (dialogue only, any length) → action script (add actions and behaviour) → staged script (add sets and camera movement) → draft (drop the brackets, add environment and detail) → final wording (adjust vocabulary and word order only). A logic and continuity calibration runs between consecutive steps.

Design premise: scripted expression sits closer to the model's strengths. The author's practical observation is that DeepSeek performs well at script writing, hence the conversion of a chapter into script form before restoring it to prose. This is an empirical judgement, not a benchmark result; re-test when switching models.

## Skills

| Skill | Responsibility |
| --- | --- |
| `novel-start` | Opening: introduces the workflow and approval points |
| `novel-onboarding` | Guided capture of setting; creates the workspace |
| `novel-prep` | Ledgers, logical links, reference works, style sample |
| `novel-anatomy` | Anatomy (2ex): spine → juvenile skeleton → rhythm test → mature skeleton |
| `novel-ascend` | Ascending pipeline |
| `novel-descend` | Descending pipeline |
| `novel-calibrate` | Calibration: boundary and taboo checks, redo on failure |
| `novel-dissect` | Dissection back into skeleton / cartilage / flesh |
| `novel-ai-judge` | AI-tell judge agent: one agent, one feature, judges only |
| `novel-deai` | De-AI-tone rewriter: fixes what the judge found, one feature at a time |
| `novel-vote` | Weighted blind review and the score ledger |
| `novel-logic` | Logic audit: four contradiction classes and six mandatory checks |
| `novel-closeout` | Chapter close-out: update ledgers, aggregate scores |
| `novel-panel` | Panel roster: each agent's role, inputs, outputs and blind rules |
| `novel-pipeline` | Overall orchestration |

## Install

From a Git marketplace:

```sh
codex plugin marketplace add UzQueen-001/novel-workshop
codex plugin add novel-workshop@novel-local
```

From a local path:

```sh
codex plugin marketplace add /path/to/novel-workshop
codex plugin add novel-workshop@novel-local
```

## Quick Start

Simply invoke the plugin — no input preparation required. It introduces the workflow and its approval points, then asks where to begin.

With existing setting and characters, enter at the preparation stage; with an outline and a chapter to advance, enter at anatomy; to clean AI tells from existing text, invoke the judge and rewriter skills directly.

The opening is not a question you must answer on the spot: state your writing requirement after reading the introduction, and the plugin routes by the content of your next message. Changes to the skill library apply to subsequent input.

## Workspace Layout

All files written into the workspace are `.txt`. A single chapter runs to thousands of characters, and with dissection drafts and ledgers on top, Markdown rendering causes noticeable stalls; plain text is cheaper to open and search. Skill manifests remain `.md`, as required by the platform.

```text
<work directory>/
├── 00_台账/   question log, open issues, foreshadow ledger, taboos, score ledger, review dimensions
├── 01_世界/   world rules, core conflict
├── 02_人物/   character sheets, character state
├── 03_规划/   long-term plan
├── 04_章节/   per-chapter artifacts (skeleton, both drafts, cross drafts, dissections, stitched draft, final text)
└── 05_文风/   style sample, reference bibliography, reference passages
```

Directory names are literal and kept in Chinese, matching the paths referenced throughout the skills.

Obsidian is optional. The plugin asks about it only when it detects an existing installation, and never prompts otherwise; nothing in the workflow depends on Obsidian features. Because workspace files are `.txt`, Obsidian wikilinks are not used.

## Design Constraints

- **Information preservation** — rewriting may not add or remove facts, numbers, dates, quotes, sources, causality or hedges. Every content word must be traceable to the source.
- **Whitelist rewriting** — de-AI-tone handles only the forms listed in the feature cards; unmatched text is preserved word for word. The cards ship with a counter-list of characteristics that measured analysis does not support and that must not trigger edits.
- **Separation of duties** — judging and rewriting belong to different agents; for any given feature, the judge and the rewriter must not be the same agent.
- **Blind review** — reviewers exchange neither scores nor comments, and candidates are stripped of source labels; results are aggregated only once complete.
- **Approval points** — creating directories, writing outside the workspace, network retrieval, each layer of setting, skeleton confirmation and irreversible plot moves all require the author's confirmation first.

## Status and Limitations

- All skills pass structural validation and the plugin manifest passes validation; **end-to-end execution has not yet been verified**. Uncovered branches during real runs are expected.
- The two pipelines currently run sequentially. This is a resource consideration only: inputs and rules are unchanged, and execution order does not affect comparability.
- The measured AI-tell data comes from third-party corpus research and has not been independently reproduced in this repository.

## Credits and License

The rules used by `novel-ai-judge` and `novel-deai` are based on the open corpus study **lieflat-less-ai-tone** by larashero3-dotcom (MIT License, Copyright (c) 2026 shiujan). That project compares 300 AI-written texts (1.18M Chinese characters, 5 models) against 329 human articles (1.65M characters) and reports per-rule ratios, retracted hypotheses and measurement scripts.

- Repository: https://github.com/larashero3-dotcom/lieflat-less-ai-tone
- This repository rewrites those findings for its skeleton / cartilage / flesh structure. For ratios, scripts and full counter-examples, refer to the original project.

This repository is released under the MIT License, Copyright (c) 2026 UzQueen-001. See [LICENSE](LICENSE).
