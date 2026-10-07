/**
 * 页面视觉快照：一次跑出桌面 + 手机双尺寸截图。
 *
 * 为什么不用侧边栏浏览器：它在这个项目上反复出现
 * BROWSER_OPERATION_TIMEOUT，且同一地址会拍出「空白」截图，
 * 而 Playwright 独立浏览器下同一页面完全正常——不可信。
 *
 * 用法：
 *   node scripts/shoot.mjs                       全部路由，双尺寸
 *   node scripts/shoot.mjs / /life              指定路由
 *   node scripts/shoot.mjs --mobile-only /life  只出手机尺寸
 *
 * 产物写到 dist-shots/（已 gitignore），不上库。
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.SHOOT_BASE || 'http://localhost:4300';
const OUT = path.resolve('dist-shots');

const SIZES = {
  desktop: { width: 1600, height: 900 },
  mobile: { width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

const ALL_ROUTES = [
  '/',
  '/archives',
  '/life',
  '/pragmatism-connectivism',
  '/brand-ai',
  '/friends',
  '/about',
  '/article/hello-world',
  '/article/tools-recommendation',
  '/article/car-sample-bag',
];

const args = process.argv.slice(2);
const mobileOnly = args.includes('--mobile-only');
const desktopOnly = args.includes('--desktop-only');
const routes = args.filter((a) => !a.startsWith('--'));
const targets = routes.length ? routes : ALL_ROUTES;

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });
const problems = [];

for (const [name, viewport] of Object.entries(SIZES)) {
  if (mobileOnly && name !== 'mobile') continue;
  if (desktopOnly && name !== 'desktop') continue;

  const ctx = await browser.newContext({ viewport, deviceScaleFactor: viewport.deviceScaleFactor ?? 1 });
  const page = await ctx.newPage();

  page.on('pageerror', (e) => problems.push(`[${name}] JS 错误: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) problems.push(`[${name}] ${r.status()} ${r.url()}`);
  });

  for (const route of targets) {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    // 等字体与轮播动画稳定，否则截到的是切换中途的帧
    await page.waitForTimeout(1800);

    const file = path.join(OUT, `${name}-${route.replace(/\//g, '_') || '_home'}.png`);
    await page.screenshot({ path: file });

    // 同时把「这块区域到底有没有内容」变成可判定的数字，而不是靠肉眼看图
    const stat = await page.evaluate(() => {
      const main = document.querySelector('main');
      const text = (document.body.innerText || '').replace(/\s+/g, ' ').trim();
      return {
        mainHeight: main ? Math.round(main.getBoundingClientRect().height) : 0,
        textLen: text.length,
        head: text.slice(0, 60),
      };
    });

    const ok = stat.textLen > 40 && stat.mainHeight > 200;
    if (!ok) problems.push(`[${name}] ${route} 内容异常: 文本${stat.textLen}字 / main高${stat.mainHeight}px`);
    console.log(`${ok ? '✅' : '❌'} ${name.padEnd(7)} ${route.padEnd(30)} 文本${String(stat.textLen).padStart(5)}字  main ${String(stat.mainHeight).padStart(4)}px`);
  }
  await ctx.close();
}

await browser.close();

console.log(`\n截图目录: ${OUT}`);
if (problems.length) {
  console.log('\n⚠️ 发现问题:');
  for (const p of [...new Set(problems)]) console.log(`   ${p}`);
  process.exit(1);
}
console.log('✅ 全部页面正常');
