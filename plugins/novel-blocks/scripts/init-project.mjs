#!/usr/bin/env node
// 建一个空的模块化小说项目骨架。只填空壳，不覆盖已有文件。
// 用法：node init-project.mjs <项目目录>

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('用法：node init-project.mjs <项目目录>');
  process.exit(1);
}
const root = resolve(dir);
const title = basename(root);

const files = {
  '骨架/线索引.md': `# 线索引 · ${title}

> 骨架是一条**写作顺序**的直线。线（视角）是块上的一个字段，不是并排的车道。

## 线

| 线 | 视角 | 备注 |
| --- | --- | --- |
| L1 | （主角名） | 主线 |

## 游标

- 写作位置：（还没开写）
- 已规划到此：
`,
  '骨架/写作顺序.md': `# 写作顺序 · ${title}

> 一行一块，按写作顺序排。空白列要留 \`| |\`，列是按位置读的。

| 块 | 线 | 简述 | 时间 | 时间位 | 预估 | 标签 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
`,
  '角色/卡索引.md': `# 角色索引 · ${title}

| 角色 | 定位 | 卡 |
| --- | --- | --- |
`,
  '场景/地点索引.md': `# 地点索引 · ${title}

| 地点 | 首次出现 | 卡 |
| --- | --- | --- |
`,
  '关系/关系索引.md': `# 关系索引 · ${title}

> A 对 B 与 B 对 A 各存一条，不合并。

| 方向 | 文件 |
| --- | --- |
`,
  '线索/线索索引.md': `# 线索索引 · ${title}

> 一入一出。出口没规划出来的线索不允许存在。

| 编号 | 线索 | 入 | 出 | 状态 |
| --- | --- | --- | --- | --- |
`,
  '世界观/世界观索引.md': `# 世界观索引 · ${title}

## 纪年法

骨架块上的绝对时间用的就是这里的纪年。必须写清：纪年名、元年是什么事、一年分几段、现在处在哪。

## 文件

- 规则/ —— 世界的硬规则
- 术语表.md —— 唯一命名来源
- 禁忌.md —— 作者不能碰的线
- 待解决问题.md —— 悬而未决的条目
`,
  '_检索/待办队列.md': `# 待办队列 · ${title}

| 事项 | 状态 | 类型 |
| --- | --- | --- |
`,
  '_检索/作者决定.md': `# 作者决定 · ${title}

> 汇总所有就地打的 \`#作者定 YYYY-MM-DD\`。检查器靠它区分「作者定的」和「agent 自己编的」。

| 日期 | 决定 | 落点 |
| --- | --- | --- |
`,
};

let made = 0;
let skipped = 0;
for (const [rel, body] of Object.entries(files)) {
  const p = join(root, rel);
  if (existsSync(p)) {
    skipped += 1;
    continue;
  }
  mkdirSync(join(p, '..'), { recursive: true });
  writeFileSync(p, body, 'utf8');
  made += 1;
}
mkdirSync(join(root, '骨架', '块'), { recursive: true });
mkdirSync(join(root, '正文'), { recursive: true });

console.log(`项目骨架：${root}`);
console.log(`新建 ${made} 个文件，跳过 ${skipped} 个已存在的`);
console.log('下一步：填 骨架/线索引.md 的线名，然后开始排写作顺序。');
