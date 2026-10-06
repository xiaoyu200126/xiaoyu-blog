/**
 * 构建后注入 Open Graph / Twitter Card 元信息，让微信、微博等
 * 分享出去时是一张有图有标题的卡片，而不是一条光秃秃的链接。
 *
 * ── 为什么必须写在 HTML 里，不能靠前端 JS 动态注入 ──
 * 微信内置浏览器转发时，会模拟爬虫去抓取页面 <head>。
 * 这个爬虫**不执行 JavaScript**，抓到的就是服务端返回的原始 HTML。
 * 所以前端在 useEffect 里 createElement('meta') 注入的那套 og 标签
 * （见 ArticlePage.tsx），对爬虫而言等于不存在。
 *
 * ── 为什么纯静态站也能做到「每篇文章一张自己的卡片」 ──
 * 这是 GitHub Pages 这类纯静态托管上唯一的可行解法：
 * 为每个文章路由预生成一个真实的 index.html，把该篇的 og 标签写死在
 * <head> 里。爬虫访问 /article/<id> 时，GitHub Pages 会优先返回这个
 * 目录下的 index.html（而不是走 SPA fallback），拿到的就是正确卡片。
 * 这与 spa-fallback.mjs 生成 404.html 是两套互补机制：
 * 浏览器直接访问仍由前端路由接管；爬虫则命中预渲染的静态 HTML。
 *
 * ── 微信的硬性要求 ──
 * · og:image 必须是绝对 URL（https 开头），相对路径抓不到
 * · 图片不能被防盗链拦截，Content-Type 必须是 image/*
 * · 尺寸建议 ≥300×300，横图 1200×630 通用兼容性最好
 * · 微信缓存卡片 24–72 小时，改动后需带随机参数重新抓取才看得到
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateOgCovers } from './make-og-covers.mjs';
import { articles, type Article } from '../src/data/articles.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = join(__dirname, '..');
const DIST = join(APP_DIR, 'dist');

// 线上域名。必须是绝对地址，微信不接受相对路径。
const SITE_URL = process.env.SITE_URL || 'https://xiaoyu-blog.cn';
const SITE_NAME = 'XIAOYU的随笔';
const DEFAULT_OG_IMAGE = '/og/blog_cover_ALL_IN_AI.jpg';

/** HTML 属性转义：标题/摘要里出现引号或尖括号会截断整个 meta 标签 */
const esc = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** 微信摘要展示长度约 50–80 字，超出会被截断，这里主动收敛 */
const clamp = (s: string, n: number) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
};

/**
 * 直接从构建好的 index.html 里读出已有的 title / description，
 * 让静态页面与运行时保持同一份文案，避免两处各写一遍然后漂移。
 */
function readBaseMeta(html: string) {
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || SITE_NAME;
  const desc =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]?.trim() || '';
  return { title, desc };
}

/** 生成一组 og / twitter meta 标签 */
function buildTags(opts: {
  title: string;
  desc: string;
  image: string;
  url: string;
  type?: string;
  publishedTime?: string;
  tags?: string[];
}) {
  const { title, desc, image, url, type = 'website', publishedTime, tags } = opts;
  const lines = [
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:title" content="${esc(clamp(title, 60))}" />`,
    `<meta property="og:description" content="${esc(clamp(desc, 110))}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:type" content="${esc(type)}" />`,
    `<meta property="og:locale" content="zh_CN" />`,
    // Twitter/LinkedIn 走同一套，避免不同平台抓不到图
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(clamp(title, 60))}" />`,
    `<meta name="twitter:description" content="${esc(clamp(desc, 110))}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
  ];
  if (publishedTime) {
    lines.push(`<meta property="article:published_time" content="${esc(publishedTime)}" />`);
    lines.push(`<meta property="article:author" content="${esc(SITE_NAME)}" />`);
  }
  if (tags?.length) {
    lines.push(`<meta property="article:tag" content="${esc(tags.join(', '))}" />`);
  }
  return lines.join('\n    ');
}

/** 把 og 标签插到 </head> 之前；已注入过则跳过，避免重复 */
function injectTags(html: string, tags: string) {
  if (html.includes('property="og:title"')) return html;
  const marker = '</head>';
  if (!html.includes(marker)) {
    console.warn('  ⚠️  index.html 里找不到 </head>，跳过注入');
    return html;
  }
  return html.replace(marker, `    ${tags}\n  ${marker}`);
}

async function main() {
  const indexPath = join(DIST, 'index.html');
  if (!existsSync(indexPath)) {
    console.error('❌ 未找到 dist/index.html，请先运行 vite build');
    process.exit(1);
  }

  const indexHtml = readFileSync(indexPath, 'utf-8');
  const base = readBaseMeta(indexHtml);

  console.log(`\n【分享卡片】文章数: ${articles.length}`);

  // 1) 生成 og 封面（1200×630 横图，微信友好）
  const ogDir = join(DIST, 'og');
  const coverMap = await generateOgCovers(articles, join(APP_DIR, 'public'), ogDir);

  // 2) 首页 / 静态页面：全站共用一张卡片
  const homeTags = buildTags({
    title: base.title,
    desc: base.desc,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    url: `${SITE_URL}/`,
  });
  writeFileSync(indexPath, injectTags(indexHtml, homeTags), 'utf-8');
  console.log(`  🏠 index.html 已注入全站卡片（${base.title}）`);

  // 404.html 是 SPA 深链接回退，同样需要一份，否则走回退的路径没有卡片
  const notFoundPath = join(DIST, '404.html');
  if (existsSync(notFoundPath)) {
    writeFileSync(
      notFoundPath,
      injectTags(readFileSync(notFoundPath, 'utf-8'), homeTags),
      'utf-8'
    );
    console.log('  🏠 404.html 已注入全站卡片');
  }

  // 3) 每篇文章：生成 dist/article/<id>/index.html
  for (const a of articles as Article[]) {
    const coverName = a.image?.replace(/^\/images\//, '') ?? '';
    const coverRel = coverMap.get(coverName);
    const coverUrl = coverRel ? `${SITE_URL}${coverRel}` : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

    const url = `${SITE_URL}/article/${a.id}`;
    const tags = buildTags({
      title: a.title,
      desc: a.excerpt,
      image: coverUrl,
      url,
      type: 'article',
      publishedTime: a.date ? a.date.slice(0, 10) : '',
      tags: a.tags,
    });

    // 用带 og 标签的首页 HTML 作模板：保留同源脚本/样式引用，
    // 浏览器端仍由前端路由接管渲染，预渲染只解决爬虫看到什么。
    const dir = join(DIST, 'article', a.id);
    mkdirSync(dir, { recursive: true });
    const html = indexHtml
      .replace(/<title>[^<]*<\/title>/i, `<title>${esc(a.title)} — ${esc(SITE_NAME)}</title>`)
      .replace(
        /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
        `<meta name="description" content="${esc(clamp(a.excerpt, 110))}" />`
      );
    writeFileSync(join(dir, 'index.html'), injectTags(html, tags), 'utf-8');
    console.log(`  📄 /article/${a.id}  ${a.title}`);
  }

  console.log(
    `\n✅ 分享卡片已生成：全站 1 张 + 每篇文章各 1 张（共 ${articles.length + 1} 张）`
  );
  console.log(`   封面目录 dist/og/（${coverMap.size} 张，1200×630）`);
  console.log(`   ⚠️ 微信缓存卡片 24–72 小时，验证时给链接加 ?v=随机数 强制重抓\n`);
}

await main();