# 小说工坊 · Novel Workshop

一个把「写小说」拆成可验收工序的 Codex 插件。

它不是一键生成器。设定靠提问问出来，骨架靠作者点头定下来，正文由两条互不相干的线各写一版，拆开重组、逐段投票，拼出终稿。

## 为什么这样写

**骨架是硬边界。** 一章先拆成骨架（事件）、软骨（过渡）、血肉（描写）。两条生成线只许给骨架加厚度，不许长出骨架外的事件、人物、设定、情报。抽掉描写和维度之后，正文里剩下的骨架必须和原骨架一模一样。

**两条线互不相干。** 升维线从骨架直接长成正文；降维线先写只有对白的剧本，再加上动作，再加布景与运镜，去掉括号补描写定成原文，最后只做词汇与语序调整。线在跑的时候看不到另一条线的任何文字。

**比出来，不是挑出来。** 两版成品互相拆开重组，交换骨架再各写一遍，得到四个版本。每章按骨架段、软骨段、血肉段三类分别对齐，每一类各选各的最优，拼成缝合文章。

**分数是记下来的，不是感觉出来的。** 多 Agent 互盲投票，八个维度带权重打分，全程进评分台账。攒几章之后，能看出哪条线在哪一步更稳——这是这个插件存在的理由之一。

## 安装

```
codex plugin marketplace add <owner>/<repo>
codex plugin add novel-workshop@novel-local
```

也可以把仓库克隆或解压到本地，用路径安装：

```
codex plugin marketplace add /path/to/novel-workshop
codex plugin add novel-workshop@novel-local
```

## 工作流

```
开场
 → 引导：启发式提问，采集世界观、总体矛盾、主角、配角，落成文件
 → 筹备：建台账、连设定、锁参照作品、取文风样本
 → 升维解剖：本章脊椎 → 幼态骨架 → 节奏测试 → 成熟骨架
 → 双线生成：升维线 ∥ 降维线（当前串行跑，但严格独立）
 → 校准：超越骨架了吗？触犯禁忌了吗？不合格退回对应工序重造
 → 交叉创作：把两版互相拆开重组，交换骨架再写两遍 → 再校准
 → 四份拆解：每类段各有四个候选 → 多 Agent 互盲投票 → 缝合
 → 回炉：缝合稿回两条线各修一版 → 再投票 → 终稿
 → 收尾：回填角色状态与伏笔、汇总评分、更新长线计划
```

## 技能

| 技能 | 作用 |
| --- | --- |
| `novel-start` | 开场：只唤起插件时介绍工作流与需要授权的环节 |
| `novel-onboarding` | 引导工作流：启发式提问采集设定，建目录 |
| `novel-prep` | 筹备工作流：台账、逻辑连接、参照作品、文风样本 |
| `novel-anatomy` | 升维解剖（2ex）：脊椎 → 幼态骨架 → 节奏测试 → 成熟骨架 |
| `novel-ascend` | 升维生成（拟画图生成法） |
| `novel-descend` | 降维生成（拍摄生成法）：对白剧本 → 主剧本 → 场景化剧本 → 定原文 → 成文 |
| `novel-calibrate` | 最终校准：越界与禁忌，退回重造 |
| `novel-dissect` | 拆解：把成品拆回骨架、软骨、血肉 |
| `novel-vote` | 多 Agent 多维投票与评分台账 |
| `novel-logic` | 逻辑审查：四类互搏与六项必查 |
| `novel-ai-judge` | AI 痕迹判定 agent：一人一特征，只判不改 |
| `novel-deai` | 去 AI 味改写 agent：按命中清单改，一次只改一个特征 |
| `novel-panel` | 评审团编制：每个 agent 的角色、输入输出与互盲规则 |
| `novel-closeout` | 章后收尾：回填台账、汇总评分 |
| `novel-pipeline` | 整体工作流编排 |

## 几条值得先知道的规则

- **不装 Obsidian 就一个字都不提。** 检测到才问一句要不要用；没有的话直接按普通文件夹走，全流程只依赖纯 Markdown。
- **库里写出来的一切都是 `.txt`。** 正文一章几千字，加上解剖稿和台账，Markdown 渲染会卡死；纯文本打开快、搜得也快。
- **一个 agent 只干一件事。** 判定与改写分开，判定按十一种特征派十一名 agent，改写一位只改一个特征，评审按八个维度派十六名，全程互盲。编制见 `novel-panel`。
- **需要你点头的地方**：动文件、联网、建库、每一层设定、骨架确认、不可逆情节报备。
- **去 AI 味只动血肉与软骨**，骨架段不参与改写；未命中规则的句子逐字保留，信息不增不减。

## 出处与许可

`novel-deai` 的规则形态与实测结论取自公开语料研究项目 **lieflat-less-ai-tone**（作者 larashero3-dotcom），MIT License, Copyright (c) 2026 shiujan。该项目用 5 个模型 300 篇 AI 文本（117.9 万汉字）对照 329 篇人类文章（164.8 万汉字），逐条给出倍率、被推翻的预设与测量脚本。

- 项目地址：https://github.com/larashero3-dotcom/lieflat-less-ai-tone
- 本插件的规则表在其结论基础上重写，并结合骨架／软骨／血肉结构做了取舍。倍率、脚本与完整反例以原项目为准。

本仓库以 MIT License 发布，Copyright (c) 2026 UzQueen-001，见 [LICENSE](LICENSE)。

---

# Novel Workshop (English)

A Codex plugin that breaks novel writing into steps you can actually inspect.

It is not a one-click generator. The setting is drawn out by questioning, the chapter skeleton is confirmed by the author, and the prose is written twice by two independent pipelines, then taken apart, recombined, and voted on segment by segment.

## Why it works this way

**The skeleton is a hard boundary.** A chapter is split into skeleton (events), cartilage (transitions), and flesh (description). Both writing pipelines may only add thickness to the skeleton — never new events, characters, settings, or information. Strip away every description, and what remains must match the skeleton exactly.

**The two pipelines stay independent.** The ascend pipeline grows prose straight from the skeleton. The descend pipeline writes a dialogue-only script first, adds action, then sets and camera movement, drops the brackets to produce a draft, and finally only adjusts wording and word order. Neither pipeline ever reads the other's text while it runs.

**Compare, don't pick.** The two drafts are dissected and re-injected into each other's pipeline, producing four versions. Segments are aligned by type — skeleton, cartilage, flesh — and the best of each type is selected to assemble a stitched chapter.

**Scores are recorded, not felt.** Multiple blind reviewers score eight weighted dimensions, and everything lands in a ledger. After a few chapters you can see which pipeline is stronger at which step — which is a large part of why this plugin exists.

## Install

```
codex plugin marketplace add <owner>/<repo>
codex plugin add novel-workshop@novel-local
```

Or clone/extract locally and install by path:

```
codex plugin marketplace add /path/to/novel-workshop
codex plugin add novel-workshop@novel-local
```

## Workflow

```
Opening
 → Onboarding: heuristic questioning to capture world, core conflict, protagonist, supporting cast
 → Preparation: ledgers, logical links, reference works, style sample
 → Anatomy (2ex): chapter spine → juvenile skeleton → rhythm test → mature skeleton
 → Two pipelines: ascend ∥ descend (run sequentially today, but kept strictly independent)
 → Calibration: did it exceed the skeleton? did it break a taboo? if so, redo that step
 → Cross-writing: dissect and re-inject both drafts, rewrite twice → calibrate again
 → Four dissections: four candidates per segment type → blind multi-agent vote → stitch
 → Final round: inject the stitched text back into both pipelines → vote → final draft
 → Close-out: update character state, foreshadow ledger, scores, long-term plan
```

## Skills

| Skill | Purpose |
| --- | --- |
| `novel-start` | Opening: introduce the workflow and the approval points |
| `novel-onboarding` | Guided capture of setting and cast; creates the workspace |
| `novel-prep` | Ledgers, logical links, reference works, style sample |
| `novel-anatomy` | Anatomy (2ex): spine → juvenile skeleton → rhythm test → mature skeleton |
| `novel-ascend` | Ascend pipeline (sketch-style generation) |
| `novel-descend` | Descend pipeline (filming-style): dialogue script → action script → staged script → draft → final wording |
| `novel-calibrate` | Calibration: boundary and taboo checks, redo on failure |
| `novel-dissect` | Dissect a finished chapter back into skeleton, cartilage, flesh |
| `novel-vote` | Blind multi-agent weighted voting and the score ledger |
| `novel-logic` | Logic audit: four contradiction classes plus six mandatory checks |
| `novel-ai-judge` | AI-tell judge agent: one agent, one feature, judges only |
| `novel-deai` | De-AI-tone rewriter: fixes what the judge found, one feature at a time |
| `novel-panel` | Panel roster: each agent's role, inputs, outputs, and blind rules |
| `novel-closeout` | Chapter close-out: update ledgers and scores |
| `novel-pipeline` | Overall orchestration |

## A few rules worth knowing up front

- **If Obsidian is not installed, it is never mentioned.** The plugin only asks once if it detects Obsidian. Otherwise everything runs on plain Markdown files.
- **Everything written into the workspace is `.txt`.** A chapter runs thousands of characters; with dissection drafts and ledgers on top, Markdown rendering stalls. Plain text opens and searches fast.
- **One agent, one job.** Judging is separated from rewriting: eleven judge agents, one per feature, then rewriters that each handle a single feature; sixteen reviewers, two per dimension, all blind. See `novel-panel` for the roster.
- **Where your approval is required**: touching files, network access, creating the workspace, every layer of setting, skeleton confirmation, and any irreversible plot move.
- **De-AI-tone touches only flesh and cartilage.** Skeleton segments are never rewritten; unmatched sentences are preserved word for word, and no information is added or removed.

## Credits and license

The rules in `novel-deai` are based on the open corpus study **lieflat-less-ai-tone** by larashero3-dotcom (MIT License, Copyright (c) 2026 shiujan). That project compares 300 AI-written texts (1.18M Chinese characters, 5 models) against 329 human articles (1.65M characters) and reports per-rule ratios, retracted hypotheses, and measurement scripts.

- Repository: https://github.com/larashero3-dotcom/lieflat-less-ai-tone
- This plugin rewrites those findings for its skeleton/cartilage/flesh structure. For ratios, scripts, and full counter-examples, refer to the original project.

This repository is released under the MIT License, Copyright (c) 2026 UzQueen-001. See [LICENSE](LICENSE).
