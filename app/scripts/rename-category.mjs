/**
 * 改 markdown 源里的 category 分类名。
 * articles.ts 由 content/posts/*.md 生成，改分类必须改源，否则会被覆盖。
 *
 * 用法：node scripts/rename-category.mjs "<旧名>" "<新名>"
 *        node scripts/rename-category.mjs --list
 */
import fs from 'node:fs';
import path from 'node:path';

const POSTS_DIR = path.resolve('content/posts');

const list = () => {
  const counts = new Map();
  for (const f of fs.readdirSync(POSTS_DIR).filter((n) => n.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8');
    const m = raw.match(/^category:\s*(.+)$/m);
    const c = m ? m[1].trim() : '(缺失)';
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  for (const [c, n] of [...counts].sort((a, b) => b[1] - a[1])) {
    console.log(`${c}\t${n} 篇`);
  }
};

const [from, to] = process.argv.slice(2);

if (from === '--list' || !from || !to) {
  list();
  process.exit(from === '--list' ? 0 : 1);
}

let changed = 0;
for (const f of fs.readdirSync(POSTS_DIR).filter((n) => n.endsWith('.md'))) {
  const p = path.join(POSTS_DIR, f);
  const raw = fs.readFileSync(p, 'utf-8');

  // 只替换 frontmatter 里的 category 行，正文出现同名词不动
  const next = raw.replace(/^(category:\s*)(.+)$/m, (whole, key, val) =>
    val.trim() === from ? `${key}${to}` : whole
  );

  if (next !== raw) {
    // 原子替换：先写临时文件再 rename，避免中途失败截断源文件
    const tmp = `${p}.tmp`;
    fs.writeFileSync(tmp, next, 'utf-8');
    fs.renameSync(tmp, p);
    console.log(`✅ ${f}: ${from} → ${to}`);
    changed++;
  }
}

console.log(`\n共修改 ${changed} 个文件`);
list();