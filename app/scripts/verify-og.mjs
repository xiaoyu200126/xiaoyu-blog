/**
 * 严格校验预渲染产物里的 og 三件套（title / image / url）是否合法。
 *
 * 为什么要单独校验、而不是相信生成脚本自己打印成功：
 * 生成脚本只管写，不管产出对不对。分享卡片一旦缺字段，页面不会报错、
 * 构建不会失败，只会在「别人转发你的链接」那一刻才暴露成一张白卡。
 * 所以这里模拟爬虫的读取方式，一路查到每个 og 字段都非空、格式正确、
 * 且 og:image 对应的封面文件真的存在于产物里。
 *
 * 属性值的结束边界按完整标签 `"/>` 匹配 —— 内容里的引号已被转义成
 * &quot;，若用 `[^"]*` 会在下一个标签处截断（校验本身就会给出假阳性）。
 *
 * 用法：node scripts/verify-og.mjs [distDir]
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = process.argv[2] || 'dist';

/** 取一个 og meta 的属性值；整个标签要求闭合，避免跨标签误匹配 */
function meta(html, property) {
  const re = new RegExp(`<meta\\s+property="${property}"\\s+content="([^"]*)"\\s*/?>`, 'i');
  return html.match(re)?.[1] ?? null;
}

/** 还原 HTML 实体，仅用于校验时展示，不写回产物 */
function decode(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function collectPages() {
  const pages = [{ name: 'index.html', file: join(DIST, 'index.html') }];
  const articleDir = join(DIST, 'article');
  if (existsSync(articleDir)) {
    for (const d of readdirSync(articleDir, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      pages.push({ name: `/article/${d.name}/`, file: join(articleDir, d.name, 'index.html') });
    }
  }
  return pages;
}

const pages = collectPages();
let fail = 0;
console.log(`校验 ${pages.length} 个页面\n`);

for (const p of pages) {
  if (!existsSync(p.file)) {
    console.log(`❌ ${p.name}: 文件不存在`);
    fail++;
    continue;
  }
  const html = readFileSync(p.file, 'utf-8');
  const problems = [];

  const title = meta(html, 'og:title');
  const desc = meta(html, 'og:description');
  const image = meta(html, 'og:image');
  const url = meta(html, 'og:url');
  const card = html.match(/<meta\s+name="twitter:card"\s+content="([^"]*)"/i)?.[1];

  if (!title) problems.push('og:title 缺失或为空');
  if (!desc) problems.push('og:description 缺失或为空');
  if (!image) problems.push('og:image 缺失或为空');
  if (!url) problems.push('og:url 缺失或为空');
  if (card !== 'summary_large_image') problems.push(`twitter:card=${card ?? '缺失'}`);

  // 微信硬性要求：og:image 必须 https 绝对 URL，且文件真实存在、不超过 2MB
  if (image) {
    if (!image.startsWith('https://')) {
      problems.push(`og:image 非 https 绝对地址：${image}`);
    } else {
      // https://域名/og/x.jpg → dist/og/x.jpg
      const rel = decode(image.replace(/^https:\/\/[^/]+/, '')).replace(/^\//, '');
      const disk = join(DIST, rel);
      if (!existsSync(disk)) {
        problems.push(`og:image 指向的文件不存在：${rel}`);
      } else {
        const kb = Math.round(statSync(disk).size / 1024);
        if (kb > 2048) problems.push(`og:image 超过微信 2MB 上限：${kb}KB`);
      }
    }
  }

  // 内容里的引号必须已转义，否则会提前闭合属性、整个标签失效
  if (title && /"/.test(title)) problems.push('og:title 含未转义引号');

  const ok = problems.length === 0;
  if (!ok) fail++;
  console.log(`${ok ? '✅' : '❌'} ${p.name}`);
  console.log(`   title: ${title ? decode(title) : '(缺失)'}`);
  console.log(`   image: ${image ?? '(缺失)'}`);
  for (const x of problems) console.log(`   ⚠️  ${x}`);
}

console.log(
  fail === 0
    ? `\n✅ 全部 ${pages.length} 个页面的 og 三件套均合法`
    : `\n❌ ${fail}/${pages.length} 个页面存在问题`
);
process.exit(fail === 0 ? 0 : 1);