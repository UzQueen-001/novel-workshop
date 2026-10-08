#!/usr/bin/env node
// 骨架可视化：把模块化小说项目渲染成单文件 HTML。
//
// 布局：y ＝ 线（谁的眼睛），x ＝ 两种可切换的横轴
//   按写作顺序：块按 B 编号等距排开 —— 换线看得到「挪到另一行」
//   按故事时间：块按时间位排开 —— 回到过去看得到「往左挪」
// 两种情况里，连线都按写作顺序走，箭头指着下一块。
//
// 用法：node viz.mjs <项目目录> [-o 输出.html] [--open]
//
// 读：
//   骨架/线索引.md      线的定义 + 游标（写作位置）
//   骨架/写作顺序.md    一张表，按写作顺序排
//   骨架/块/B01_*.md    块文件（有就点得开）
//   线索/*.md           入 / 出 / 状态 / 备注
//   角色/<名字>/
//   _检索/待办队列.md

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { execFile } from 'node:child_process';

const argv = process.argv.slice(2);
let projectDir = null;
let outFile = null;
let openAfter = false;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '-o' || a === '--out') outFile = argv[++i];
  else if (a === '--open') openAfter = true;
  else if (!a.startsWith('-')) projectDir = a;
}
if (!projectDir) {
  console.error('用法：node viz.mjs <项目目录> [-o 输出.html] [--open]');
  process.exit(1);
}
projectDir = resolve(projectDir);
outFile = resolve(outFile || join(projectDir, '骨架总览.html'));

// ---------- 工具 ----------

const read = (p) => {
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return null;
  }
};
const listDir = (p) => {
  try {
    return readdirSync(p);
  } catch {
    return [];
  }
};
const isDir = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

function splitCells(line) {
  let s = line.trim().replace(/^[-*]\s+/, '');
  s = s.replace(/^\|/, '').replace(/\|$/, '');
  const cells = s.split(/\s*[|｜]\s*/).map((x) => x.trim());
  if (cells.every((c) => c === '' || /^-{2,}$/.test(c))) return [];
  return cells;
}

function findVault(dir) {
  let d = dir;
  for (let i = 0; i < 8; i++) {
    if (isDir(join(d, '.obsidian'))) return d;
    const up = resolve(d, '..');
    if (up === d) break;
    d = up;
  }
  return null;
}

const vault = findVault(projectDir);
const vaultName = vault ? basename(vault) : null;
function linkFor(absPath) {
  if (!vault || !absPath) return null;
  const rel = resolve(absPath).slice(vault.length + 1).replace(/\.md$/i, '');
  return `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(rel)}`;
}

// ---------- 装载 ----------

const problems = [];
const skeletonDir = join(projectDir, '骨架');
if (!isDir(skeletonDir)) {
  console.error(`没找到骨架目录：${skeletonDir}`);
  process.exit(1);
}

const lineNames = new Map();
const cursors = {};
for (const raw of (read(join(skeletonDir, '线索引.md')) || '').split('\n')) {
  const cells = splitCells(raw);
  if (cells[0] && /^L\d+$/.test(cells[0]) && cells[1]) lineNames.set(cells[0], cells[1]);
  const cm = raw.match(/^\s*[-*]?\s*(写作位置|已规划到此)\s*[:：]\s*(B\d+)/);
  if (cm) cursors[cm[1]] = cm[2];
}

const orderFiles = existsSync(join(skeletonDir, '写作顺序.md'))
  ? [join(skeletonDir, '写作顺序.md')]
  : listDir(skeletonDir)
      .filter((f) => /^L\d+[_-].*\.md$/.test(f))
      .sort()
      .map((f) => join(skeletonDir, f));

const blocks = [];
for (const file of orderFiles) {
  for (const raw of (read(file) || '').split('\n')) {
    if (!/[|｜]/.test(raw)) continue;
    const cs = splitCells(raw);
    if (!cs.length) continue;
    const id = (cs[0] || '').replace(/[\[\]]/g, '').trim();
    if (!/^B\d+$/.test(id)) continue;
    // 八列：块 | 线 | 简述 | 时间 | 时间位 | 预估 | 标签 | 状态
    // 兼容七列（没有时间位）
    const eight = cs.length >= 8;
    const timeRaw = cs[4] || '';
    const b = {
      id,
      line: (cs[1] || '').trim(),
      brief: cs[2] || '',
      time: cs[3] || '',
      tpos: eight ? parseFloat(timeRaw) : NaN,
      est: parseInt(((eight ? cs[5] : cs[4]) || '').replace(/[^\d]/g, ''), 10) || 0,
      tags: (eight ? cs[6] : cs[5]) || '',
      status: (eight ? cs[7] : cs[6]) || '',
      file: null,
      clues: [...raw.matchAll(/(C\d+)(入|出|提及)/g)].map((m) => ({ id: m[1], kind: m[2] })),
      locked: /🔒|锁定/.test(raw),
      irreversible: /⚠|不可逆/.test(raw),
      remote: /🕳|远端/.test(raw),
      back: /回到过去|↩/.test(raw),
      rel: (raw.match(/相对时间\s*([+\-−]?[^\s|｜]*)/) || [])[1] || '',
    };
    if (eight && timeRaw && Number.isNaN(b.tpos)) problems.push(`${id} 的时间位不是数字：「${timeRaw}」`);
    if (b.est && (b.est < 10 || b.est > 1000)) problems.push(`${id} 的预估字数 ${b.est} 超出 10–1000`);
    blocks.push(b);
  }
}
blocks.sort((a, b) => parseInt(a.id.slice(1), 10) - parseInt(b.id.slice(1), 10));
if (!blocks.length) {
  const empty = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>骨架总览 · ${esc(basename(projectDir))}</title></head>
<body style="font:14px/1.7 -apple-system,'PingFang SC',system-ui,sans-serif;background:#0f1115;color:#e8eaf0;padding:48px;max-width:760px">
<h1 style="font-size:17px;font-weight:600">${esc(basename(projectDir))} · 还没排骨架</h1>
<p style="color:#8b93a7">往 <code style="background:#1a1e26;padding:1px 5px;border-radius:4px">骨架/写作顺序.md</code> 里加行，格式是：</p>
<pre style="background:#1a1e26;padding:14px;border-radius:8px;overflow:auto">| 块 | 线 | 简述 | 时间 | 时间位 | 预估 | 标签 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B01 | L1 | 开场 | 元年·第一日 | 1 | 320 | | 已规划 |</pre>
<p style="color:#8b93a7">线名写在 <code style="background:#1a1e26;padding:1px 5px;border-radius:4px">骨架/线索引.md</code> 里。</p>
</body></html>`;
  writeFileSync(outFile, empty, 'utf8');
  console.log(`已生成：${outFile}（还没排骨架）`);
  if (openAfter) execFile('open', [outFile], () => {});
  process.exit(0);
}
const blockIndex = new Map(blocks.map((b) => [b.id, b]));

const blockFiles = listDir(join(skeletonDir, '块'));
for (const b of blocks) {
  const hit = blockFiles.find((f) => f.startsWith(b.id + '_') || f.startsWith(b.id + '-'));
  if (hit) b.file = join(skeletonDir, '块', hit);
}

const clues = [];
for (const f of listDir(join(projectDir, '线索')).sort()) {
  if (!f.endsWith('.md') || f.includes('索引')) continue;
  const abs = join(projectDir, '线索', f);
  const text = read(abs) || '';
  const clue = { file: abs, id: (text.match(/\bC\d+\b/) || [f.replace(/\.md$/, '')])[0], title: '', inRef: null, outRef: null, status: '', note: '' };
  const t = text.match(/^#\s*(.*)$/m);
  if (t) clue.title = t[1].trim();
  for (const raw of text.split('\n')) {
    const m = raw.match(/^\s*[-*]?\s*(入|出|状态|备注)\s*[:：]?\s*(.+?)\s*$/);
    if (!m) continue;
    if (m[1] === '入' || m[1] === '出') {
      const bm = m[2].match(/(B\d+)/);
      const ref = { block: bm ? bm[1] : null, brief: bm ? m[2].slice(m[2].indexOf(bm[1]) + bm[1].length).trim() : m[2] };
      if (!ref.block) problems.push(`${clue.id} 的${m[1]}口没写块 ID`);
      if (m[1] === '入') clue.inRef = ref;
      else clue.outRef = ref;
    } else if (m[1] === '状态') clue.status = m[2];
    else clue.note = m[2];
  }
  clue.dangling = !clue.outRef || !clue.outRef.block;
  if (clue.dangling && !/废弃/.test(clue.status)) problems.push(`${clue.id} 有入无出（线索模块不允许出口悬空）`);
  for (const k of ['inRef', 'outRef']) {
    const r = clue[k];
    if (r && r.block && !blockIndex.has(r.block)) problems.push(`${clue.id} 的${k === 'inRef' ? '入' : '出'}口指向不存在的块 ${r.block}`);
  }
  clues.push(clue);
}

const characters = listDir(join(projectDir, '角色'))
  .filter((f) => isDir(join(projectDir, '角色', f)))
  .map((f) => ({ name: f, file: linkFor(join(projectDir, '角色', f, '卡.md')) }));

const todos = [];
for (const raw of (read(join(projectDir, '_检索', '待办队列.md')) || '').split('\n')) {
  const line = raw.trim();
  if (!line || /^[#>]/.test(line)) continue;
  if (/^\|/.test(line)) {
    const cs = splitCells(line);
    if (cs.length >= 2 && cs[0]) todos.push({ text: cs[0], status: cs[1] || '' });
  } else {
    const m = line.match(/^[-*]\s*\[( |x|X)\]\s*(.+)$/);
    if (m) todos.push({ text: m[2], status: m[1].toLowerCase() === 'x' ? '已完成' : '未处理' });
  }
}

// ---------- 布局 ----------

const usedLines = [...new Set(blocks.map((b) => b.line))];
const lineOrder = [...lineNames.keys()].filter((l) => usedLines.includes(l));
for (const l of usedLines) if (!lineOrder.includes(l)) lineOrder.push(l);

const GUTTER = 128;
const TOP = 96;
const ROW_H = 108;
const BLOCK_H = 70;
const CLUE_COLORS = ['#6ea8fe', '#f7b955', '#8ddb8c', '#e585c4', '#5fd3d3', '#f08a7a'];
const colorOf = (line) => CLUE_COLORS[Math.max(0, lineOrder.indexOf(line)) % CLUE_COLORS.length];
const lineLabel = (id) => (id ? `${id} ${lineNames.get(id) || ''}`.trim() : '—');

const rowY = (line) => TOP + Math.max(0, lineOrder.indexOf(line)) * ROW_H;

const fit = (s, w, pad = 20) => {
  const max = Math.max(3, Math.floor((w - pad) / 11));
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
};

// 两种横轴各算一次坐标，产出每一行的位置与整张画布的大小
function computeLayout(mode) {
  const rows = [];
  let width;
  let y = TOP;
  if (mode === 'order') {
    // 横轴＝写作顺序：等距排开，宽度 ∝ 预估字数
    let x = GUTTER;
    for (const b of blocks) {
      b._w = Math.max(128, Math.min(300, 60 + b.est * 0.34));
      b._x = x;
      x += b._w + 30;
    }
    width = x + 10;
    for (const ln of lineOrder) {
      for (const b of blocks.filter((v) => v.line === ln)) b._y = y;
      rows.push({ line: ln, y: y - 18, h: ROW_H - 16 });
      y += ROW_H;
    }
  } else {
    // 横轴＝故事时间：x 由时间位决定，同一时刻的块在行内往下叠
    const withT = blocks.filter((b) => !Number.isNaN(b.tpos));
    const tmin = withT.length ? Math.min(...withT.map((b) => b.tpos)) : 0;
    const tmax = withT.length ? Math.max(...withT.map((b) => b.tpos)) : 1;
    const span = tmax - tmin || 1;
    const track = Math.max(900, blocks.length * 130);
    for (const b of blocks) {
      b._w = Math.max(128, Math.min(280, 60 + b.est * 0.3));
      b._x = Number.isNaN(b.tpos)
        ? GUTTER + 20
        : GUTTER + 30 + ((b.tpos - tmin) / span) * (track - 200);
    }
    width = GUTTER + track + 60;
    for (const ln of lineOrder) {
      const list = blocks.filter((v) => v.line === ln);
      const groups = new Map();
      for (const b of list) {
        const k = String(b.tpos);
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(b);
      }
      let maxStack = 1;
      for (const arr of groups.values()) {
        arr.forEach((b, i) => {
          b._stack = i;
        });
        maxStack = Math.max(maxStack, arr.length);
      }
      const bandH = Math.max(BLOCK_H, maxStack * (BLOCK_H + 10));
      for (const b of list) b._y = y + b._stack * (BLOCK_H + 10);
      rows.push({ line: ln, y: y - 18, h: bandH + 12 });
      y += bandH + 44;
    }
  }
  return { rows, width, height: y + 56 };
}

function buildSvg(mode) {
  const { rows, width, height } = computeLayout(mode);
  const parts = [];

  // 行底板与行名
  rows.forEach((r) => {
    parts.push(`<rect class="rowband" x="0" y="${r.y}" width="${width}" height="${r.h}"></rect>`);
    parts.push(`<text class="rowname" x="18" y="${r.y + 40}">${esc(r.line)}</text>`);
    parts.push(`<text class="rowsub" x="18" y="${r.y + 58}">${esc(lineNames.get(r.line) || '')}</text>`);
  });

  const geom = (b) => ({ x: b._x, y: b._y, w: b._w, h: BLOCK_H });

  // 连线：按写作顺序，逐段取最近的两个口
  const portOf = (g) => ({
    top: { x: g.x + g.w / 2, y: g.y },
    bottom: { x: g.x + g.w / 2, y: g.y + g.h },
    left: { x: g.x, y: g.y + g.h / 2 },
    right: { x: g.x + g.w, y: g.y + g.h / 2 },
  });
  for (let i = 0; i < blocks.length - 1; i++) {
    const a = geom(blocks[i]);
    const b = geom(blocks[i + 1]);
    const pa = portOf(a);
    const pb = portOf(b);
    let best = null;
    for (const ka of Object.keys(pa))
      for (const kb of Object.keys(pb)) {
        const d = Math.hypot(pa[ka].x - pb[kb].x, pa[ka].y - pb[kb].y);
        if (!best || d < best.d) best = { d, p1: pa[ka], p2: pb[kb], ka, kb };
      }
    const horiz = (best.ka === 'left' || best.ka === 'right') && (best.kb === 'left' || best.kb === 'right');
    let d;
    if (horiz) {
      const mx = (best.p1.x + best.p2.x) / 2;
      d = `M ${best.p1.x} ${best.p1.y} C ${mx} ${best.p1.y}, ${mx} ${best.p2.y}, ${best.p2.x} ${best.p2.y}`;
    } else {
      const my = (best.p1.y + best.p2.y) / 2;
      d = `M ${best.p1.x} ${best.p1.y} C ${best.p1.x} ${my}, ${best.p2.x} ${my}, ${best.p2.x} ${best.p2.y}`;
    }
    const cls = ['conn'];
    if (blocks[i + 1].back) cls.push('is-back');
    parts.push(`<path class="${cls.join(' ')}" d="${d}" marker-end="url(#${blocks[i + 1].back ? 'arrowBack' : 'arrow'})"></path>`);
  }

  // 块
  for (const b of blocks) {
    const g = geom(b);
    const href = linkFor(b.file) || linkFor(orderFiles[0]);
    const chips = [];
    if (b.locked) chips.push('🔒');
    if (b.irreversible) chips.push('⚠');
    if (b.remote) chips.push('🕳');
    if (b.back) chips.push('↩');
    const cls = ['blk'];
    if (b.locked) cls.push('is-locked');
    if (b.irreversible) cls.push('is-irreversible');
    if (b.remote) cls.push('is-remote');
    if (b.back) cls.push('is-back');
    if (b.id === cursors['写作位置']) cls.push('is-cursor');
    const cid = `cp-${mode}-${b.id}`;
    const tip = `${b.id}（${lineLabel(b.line)}）\n${b.brief}\n时间：${b.time || '—'}\n预估：${b.est || '—'} 字\n状态：${b.status || '—'}${b.file ? '\n点击打开块文件' : ''}`;
    parts.push(`<a href="${esc(href || '#')}" target="_blank" rel="noopener"><g class="${cls.join(' ')}">
      <clipPath id="${cid}"><rect x="${g.x + 10}" y="${g.y + 2}" width="${g.w - 20}" height="${g.h - 4}"></rect></clipPath>
      <rect class="box" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="9"></rect>
      <rect class="linebar" x="${g.x}" y="${g.y}" width="4" height="${g.h}" rx="2" fill="${colorOf(b.line)}"></rect>
      <g clip-path="url(#${cid})">
        <text class="id" x="${g.x + 13}" y="${g.y + 21}">${esc(fit(b.id, g.w, 26))}${chips.length ? ' ' + chips.join('') : ''}</text>
        <text class="brief" x="${g.x + 13}" y="${g.y + 41}">${esc(fit(b.brief, g.w))}</text>
        <text class="meta" x="${g.x + 13}" y="${g.y + 60}">${esc(fit((b.time || '—') + ' · ' + (b.est || '—') + '字', g.w))}</text>
      </g>
      <title>${esc(tip)}</title></g></a>`);
  }

  // 写作位置徽标
  const cid = cursors['写作位置'];
  if (cid && blockIndex.has(cid)) {
    const g = geom(blockIndex.get(cid));
    parts.push(`<text class="cursor-badge" x="${g.x}" y="${g.y - 8}">◀ 写作位置</text>`);
  }

  // 线索：走最上方，中点挂可点方块
  clues.forEach((clue, i) => {
    const a = clue.inRef && clue.inRef.block ? blockIndex.get(clue.inRef.block) : null;
    if (!a) return;
    const color = CLUE_COLORS[i % CLUE_COLORS.length];
    const ga = geom(a);
    const x1 = ga.x + ga.w / 2;
    const y1 = ga.y;
    const href = linkFor(clue.file) || '#';
    const apex = 66 - (i % 3) * 22;
    if (clue.dangling) {
      parts.push(`<path class="clue is-broken" d="M ${x1} ${y1} L ${x1} ${apex + 12}" stroke="${color}"></path>`);
      parts.push(`<a href="${esc(href)}" target="_blank" rel="noopener"><g class="clue-chip is-broken">
        <rect x="${x1 - 36}" y="${apex - 10}" width="72" height="20" rx="5"></rect>
        <text x="${x1}" y="${apex + 4}" text-anchor="middle">${esc(clue.id)} ✗ 无出口</text></g></a>`);
      return;
    }
    const b = blockIndex.get(clue.outRef.block);
    if (!b) return;
    const gb = geom(b);
    const x2 = gb.x + gb.w / 2;
    const y2 = gb.y;
    parts.push(`<path class="clue" d="M ${x1} ${y1} C ${x1} ${apex}, ${x2} ${apex}, ${x2} ${y2}" stroke="${color}" fill="none"></path>
      <circle cx="${x1}" cy="${y1}" r="3.5" fill="${color}"></circle>
      <circle cx="${x2}" cy="${y2}" r="3.5" fill="${color}"></circle>`);
    const mx = (x1 + x2) / 2;
    parts.push(`<a href="${esc(href)}" target="_blank" rel="noopener"><g class="clue-chip">
      <rect x="${mx - 30}" y="${apex - 10}" width="60" height="20" rx="5"></rect>
      <text x="${mx}" y="${apex + 4}" text-anchor="middle">${esc(clue.id)}</text>
      <title>${esc(clue.id + ' ' + clue.title + '（点开线索）')}</title></g></a>`);
  });

  return { width, height, body: parts.join('') };
}

const viewOrder = buildSvg('order');
const viewTime = buildSvg('time');

const totalEst = blocks.reduce((s, b) => s + b.est, 0);
const cursorId = cursors['写作位置'];
const cursorIdx = cursorId && blockIndex.has(cursorId) ? blocks.findIndex((b) => b.id === cursorId) : -1;
const ahead = cursorIdx >= 0 ? blocks.slice(cursorIdx + 1).reduce((s, b) => s + b.est, 0) : null;
const danglingCount = clues.filter((c) => c.dangling).length;
const pendingTodos = todos.filter((t) => !/已完成|完成|done/i.test(t.status));

const defs = `<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" opacity="0.55"></path></marker>
  <marker id="arrowBack" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#c58cff"></path></marker>
</defs>`;

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>骨架总览 · ${esc(basename(projectDir))}</title>
<style>
  :root{
    color-scheme: dark light;
    --bg:#0f1115; --fg:#e8eaf0; --muted:#8b93a7; --line:#2a2f3a; --card:#1a1e26;
    --warn:#ff7a7a; --back:#c58cff;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 -apple-system,"PingFang SC","Noto Sans SC",system-ui,sans-serif}
  header{padding:16px 22px 12px;border-bottom:1px solid var(--line)}
  h1{margin:0 0 10px;font-size:17px;font-weight:600}
  .stats{display:flex;flex-wrap:wrap;gap:16px;color:var(--muted);font-size:12.5px}
  .stats b{color:var(--fg);font-weight:500}
  .modes{display:flex;gap:6px;margin:12px 0 0}
  .modes button{background:transparent;color:var(--muted);border:1px solid var(--line);border-radius:6px;padding:4px 12px;font-size:12.5px;cursor:pointer;font-family:inherit}
  .modes button.is-on{color:var(--fg);border-color:var(--fg);background:#1e2330}
  .wrap{display:flex;align-items:flex-start}
  .canvas{flex:1;overflow:auto;padding:4px 12px 24px}
  aside{width:300px;flex:0 0 300px;border-left:1px solid var(--line);padding:16px;max-height:100vh;overflow:auto}
  aside h2{font-size:12.5px;font-weight:600;color:var(--muted);margin:18px 0 8px}
  aside h2:first-child{margin-top:0}
  aside ul{margin:0;padding:0}
  aside li{margin:0 0 6px;font-size:12.5px;list-style:none}
  aside a{color:#6ea8fe;text-decoration:none}
  .tag{display:inline-block;padding:0 5px;border:1px solid var(--line);border-radius:4px;color:var(--muted);font-size:11px;margin-left:4px}
  .tag.warn{color:var(--warn);border-color:var(--warn)}
  svg{display:block;font-family:inherit;color:var(--fg)}
  .rowband{fill:#ffffff;opacity:.022}
  .rowname{fill:var(--fg);font-size:13px;font-weight:500}
  .rowsub{fill:var(--muted);font-size:11px}
  .blk .box{fill:var(--card);stroke:var(--line);stroke-width:1}
  .blk.is-locked .box{stroke:#f7b955}
  .blk.is-irreversible .box{stroke:var(--warn);stroke-width:1.6}
  .blk.is-remote .box{stroke-dasharray:5 4}
  .blk.is-back .box{stroke:var(--back)}
  .blk.is-cursor .box{stroke:#8ddb8c;stroke-width:2}
  .blk text.id{fill:var(--fg);font-size:11.5px;font-weight:500}
  .blk text.brief{fill:var(--fg);font-size:11px;opacity:.92}
  .blk text.meta{fill:var(--muted);font-size:10.5px}
  a:hover .blk .box{fill:#222835}
  .conn{stroke:currentColor;stroke-width:1.6;fill:none;opacity:.5}
  .conn.is-back{stroke:var(--back);opacity:.9}
  .cursor-badge{fill:#8ddb8c;font-size:11px}
  .clue{stroke-width:1.8;fill:none;opacity:.85}
  .clue-chip rect{fill:var(--card);stroke:var(--line)}
  .clue-chip text{fill:var(--fg);font-size:10.5px}
  .clue-chip.is-broken rect{stroke:var(--warn)}
  .clue-chip.is-broken text{fill:var(--warn)}
  .clue-chip:hover rect{fill:#222835}
  footer{padding:10px 22px 26px;color:var(--muted);font-size:11.5px;border-top:1px solid var(--line)}
  code{background:var(--card);border:1px solid var(--line);border-radius:4px;padding:0 4px}
</style>
</head>
<body>
<header>
  <h1>${esc(basename(projectDir))} · 骨架总览</h1>
  <div class="stats">
    <span>块 <b>${blocks.length}</b></span>
    <span>线 <b>${lineOrder.length}</b>（${lineOrder.map((l) => esc(lineLabel(l))).join(' / ')}）</span>
    <span>预估总字数 <b>${totalEst.toLocaleString()}</b></span>
    <span>写作位置 <b>${esc(cursorId || '未设')}</b></span>
    <span>往后 <b>${ahead == null ? '—' : ahead.toLocaleString()}</b>${ahead != null && ahead < 20000 ? ' <span class="tag warn">不足 20k</span>' : ''}</span>
    <span>线索 <b>${clues.length}</b>${danglingCount ? ` <span class="tag warn">${danglingCount} 条无出口</span>` : ''}</span>
  </div>
  <div class="modes">
    <button type="button" class="mode is-on" data-view="order">按写作顺序</button>
    <button type="button" class="mode" data-view="time">按故事时间</button>
  </div>
</header>
<div class="wrap">
  <div class="canvas">
    <svg class="view" data-view="order" width="${viewOrder.width}" height="${viewOrder.height}" viewBox="0 0 ${viewOrder.width} ${viewOrder.height}" role="img" aria-label="按写作顺序">${defs}${viewOrder.body}</svg>
    <svg class="view" data-view="time" style="display:none" width="${viewTime.width}" height="${viewTime.height}" viewBox="0 0 ${viewTime.width} ${viewTime.height}" role="img" aria-label="按故事时间">${defs.replace(/id="arrow/g, 'id="arrowT')}${viewTime.body.replace(/url\(#arrow/g, 'url(#arrowT')}</svg>
  </div>
  <aside>
    <h2>问题（${problems.length}）</h2>
    <ul>${problems.length ? problems.map((p) => `<li>⚠ ${esc(p)}</li>`).join('') : '<li>无</li>'}</ul>
    <h2>线索（${clues.length}）</h2>
    <ul>${clues.map((c) => `<li><a href="${esc(linkFor(c.file) || '#')}" target="_blank" rel="noopener">${esc(c.id)}</a> ${esc((c.title || '').replace(/^C\d+\s*[·:：]?\s*/, ''))}<span class="tag${c.dangling ? ' warn' : ''}">${esc(c.status || (c.dangling ? '无出口' : '已规划'))}</span></li>`).join('') || '<li>无</li>'}</ul>
    <h2>待办（${pendingTodos.length} / ${todos.length}）</h2>
    <ul>${todos.length ? todos.slice(0, 30).map((t) => `<li>${esc(t.text)}${t.status ? `<span class="tag${/已完成/.test(t.status) ? '' : ' warn'}">${esc(t.status)}</span>` : ''}</li>`).join('') : '<li>无</li>'}</ul>
    <h2>角色（${characters.length}）</h2>
    <ul>${characters.map((c) => `<li><a href="${esc(c.file || '#')}" target="_blank" rel="noopener">${esc(c.name)}</a></li>`).join('') || '<li>无</li>'}</ul>
    <h2>怎么读</h2>
    <ul>
      <li><b>行</b>是线：换线就是块挪到了另一行。</li>
      <li><b>横轴</b>两选一：按写作顺序（B 编号从左到右）／按故事时间（回到过去的块会往左挪）。</li>
      <li>连线一律实线，箭头指着下一块；紫色的是回到过去。</li>
      <li>上方弧线是线索，中间的方块可以点开它。</li>
      <li>绿框那块是写作位置。</li>
    </ul>
  </aside>
</div>
<footer>
  只读渲染，事实以文件为准 · 生成时间 ${new Date().toLocaleString('zh-CN')} · 源：<code>${esc(projectDir)}</code>
</footer>
<script>
  document.querySelectorAll('.mode').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.mode').forEach(function (b) { b.classList.toggle('is-on', b === btn); });
      var v = btn.getAttribute('data-view');
      document.querySelectorAll('svg.view').forEach(function (s) {
        s.style.display = s.getAttribute('data-view') === v ? 'block' : 'none';
      });
    });
  });
</script>
</body>
</html>`;

writeFileSync(outFile, html, 'utf8');
console.log(`已生成：${outFile}`);
console.log(`块 ${blocks.length} · 线 ${lineOrder.length} · 预估 ${totalEst} 字 · 线索 ${clues.length} · 问题 ${problems.length}`);
for (const p of problems) console.log('  ⚠ ' + p);
if (openAfter) execFile('open', [outFile], () => {});
