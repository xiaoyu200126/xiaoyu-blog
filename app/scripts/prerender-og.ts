/**
 * 构建后预渲染 Open Graph 卡片 + 栏目/文章页。
 *
 * 微信转发时内置浏览器会模拟爬虫抓 <head>，且不执行 JavaScript，所以
 * og 标签必须写死在 HTML 里（前端 useEffect 动态注入的那套等于不存在）。
 *
 * 纯静态托管下让深链接返回 200 的唯一解法：为每条路由生成真实的
 * <route>/index.html。爬虫和状态码看到它，浏览器端仍由前端路由接管。
 * 与 spa-fallback.mjs 生成的 404.html 互补（后者带 404 状态码）。
 *
 * 微信硬性要求：og:image 须为 https 绝对 URL、Content-Type 为 image/*、
 * 尺寸 ≥300×300；卡片缓存 24–72 小时，验证时加 ?v=随机数 强制重抓。
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

/**
 * 需要预生成目录的静态路由。
 *
 * 必须与 App.tsx 的路由表保持一致——新增页面时这里要同步加，
 * 否则该路由会退回 404 状态码。路由表见 src/App.tsx。
 * 标题文案与 MobileMenu / Footer 保持一致。
 */
const STATIC_ROUTES: { path: string; title: string; desc: string; image?: string }[] = [
  { path: '/about', title: '关于XIAOYU', desc: '我是谁，这个博客为什么存在，以及接下来打算写些什么。' },
  { path: '/archives', title: '精选文章', desc: '全部文章的归档与标签索引，按时间倒序排列。' },
  { path: '/life', title: '生活碎碎念', desc: '技术之外的思考。关于城市、关于摄影、关于那些无关紧要但真实存在的感受。' },
  { path: '/pragmatism-connectivism', title: '思考随笔', desc: '记录我关于学习方法、认知边界与知识管理的思考。' },
  { path: '/brand-ai', title: 'BRAND & AI', desc: 'BRAND ALL IN AI 的实践记录：从认知外包到认知卸载。' },
  { path: '/friends', title: '晓宇友人账', desc: '朋友们的小站，逛逛看。' },
];

/** 构建产物首页 HTML，writeRouteHtml 以它为模板（模块作用域，供函数访问） */
let indexHtml = '';

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

  indexHtml = readFileSync(indexPath, 'utf-8');
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

    writeRouteHtml(`/article/${a.id}`, a.title, a.excerpt, tags, coverUrl);
    console.log(`  📄 /article/${a.id}  ${a.title}`);
  }

  // 静态路由：为每个栏目预生成 index.html
  //
  // GitHub Pages 对不存在的路径只回退到 404.html，而回退响应带 404 状态码 ——
  // 浏览器能渲染，但搜索引擎与链接预览会判为「页面不存在」。
  // 预生成目录后命中真实文件，状态码才是 200。
  for (const s of STATIC_ROUTES) {
    const tags = buildTags({
      title: s.title,
      desc: s.desc,
      image: `${SITE_URL}${s.image ?? DEFAULT_OG_IMAGE}`,
      url: `${SITE_URL}${s.path}`,
    });
    writeRouteHtml(s.path, s.title, s.desc, tags, `${SITE_URL}${s.image ?? DEFAULT_OG_IMAGE}`);
    console.log(`  📁 ${s.path}  ${s.title}`);
  }

  console.log(
    `\n✅ 分享卡片已生成：全站 1 张 + 每篇文章各 1 张（共 ${articles.length + 1} 张）`
  );
  console.log(`   栏目页预渲染 ${STATIC_ROUTES.length} 个（状态码 200，深链接不再 404）`);
  console.log(`   封面目录 dist/og/（${coverMap.size} 张，1200×630）`);
  console.log(`   ⚠️ 微信缓存卡片 24–72 小时，验证时给链接加 ?v=随机数 强制重抓\n`);
}

/** 为一个路由写出 dist/<path>/index.html，以首页 HTML 为模板保留同源资源引用 */
function writeRouteHtml(
  routePath: string,
  title: string,
  desc: string,
  tags: string,
  _coverUrl: string
) {
  const dir = join(DIST, ...routePath.split('/').filter(Boolean));
  mkdirSync(dir, { recursive: true });
  const html = indexHtml
    .replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)} — ${esc(SITE_NAME)}</title>`)
    .replace(
      /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="description" content="${esc(clamp(desc, 110))}" />`
    );
  writeFileSync(join(dir, 'index.html'), injectTags(html, tags), 'utf-8');
}

await main();