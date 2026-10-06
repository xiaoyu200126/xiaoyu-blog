/**
 * 为微信/社交分享卡片生成 og 封面图。
 *
 * 微信分享卡片的封面位是横向的（社区通用标准 1.91:1，即 1200×630）。
 * 文章原图比例各异（1200×674 / 1200×1600 / 1024×1024），
 * 直接扔给微信会由它居中裁切，主体容易正好被切掉。
 * 这里统一处理成 1200×630：等比放大到刚好盖满画布，再居中裁切，
 * 铺满画面、无留白、不拉伸变形 —— 与微信自己那张卡片的取景逻辑一致。
 *
 * 输出到 dist/og/（构建后调用），不进 public/：
 * 既避免生成物污染源目录，也避免每篇文章一张图进仓库、拖慢构建。
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const OUT_W = 1200;
const OUT_H = 630;
const JPEG_Q = 82;

/**
 * 把任意尺寸原图处理成 1200×630 的横向封面。
 * @returns {{w:number,h:number,bytes:number}}
 */
async function makeCover(srcPath, outPath) {
  const meta = await sharp(srcPath, { failOn: 'none' }).metadata();
  const srcW = meta.width || OUT_W;
  const srcH = meta.height || OUT_H;

  // cover 缩放：取 max(scaleX, scaleY)，保证短边也盖住画布
  const scale = Math.max(OUT_W / srcW, OUT_H / srcH);
  const fitW = Math.round(srcW * scale);
  const fitH = Math.round(srcH * scale);

  // 按原比例缩放（fitW/fitH 严格等比，fill 不会引入形变），再居中裁切
  const resized = await sharp(srcPath, { failOn: 'none' })
    .resize(fitW, fitH, { fit: 'fill' })
    .extract({
      left: Math.round((fitW - OUT_W) / 2),
      top: Math.round((fitH - OUT_H) / 2),
      width: OUT_W,
      height: OUT_H,
    })
    .jpeg({ quality: JPEG_Q, mozjpeg: true })
    .toBuffer();

  writeFileSync(outPath, resized);
  return { w: OUT_W, h: OUT_H, bytes: resized.length };
}

/**
 * 为每篇文章的原图生成一张 og 封面，按原图名去重
 * （featured-1.jpg 被两篇文章共用，应只裁一次、共享同一个封面文件）。
 *
 * @returns {Map<string,string>} 原图文件名 -> 封面 URL 路径
 */
export async function generateOgCovers(articles, publicDir, outDir) {
  mkdirSync(outDir, { recursive: true });

  const bySource = new Map();
  for (const a of articles) {
    const srcName = basename(a.image || '');
    if (!srcName || bySource.has(srcName)) continue;

    const srcPath = join(publicDir, 'images', srcName);
    if (!existsSync(srcPath)) {
      console.warn(`  ⚠️  找不到原图，跳过封面：${srcName}`);
      continue;
    }

    const outName = `${srcName.replace(/\.[^.]+$/, '')}.jpg`;
    const r = await makeCover(srcPath, join(outDir, outName));
    bySource.set(srcName, `/og/${outName}`);
    console.log(
      `  🖼️  ${srcName.padEnd(28)} → /og/${outName.padEnd(26)} ${OUT_W}×${OUT_H}  ${Math.round(r.bytes / 1024)} KB`
    );
  }
  return bySource;
}