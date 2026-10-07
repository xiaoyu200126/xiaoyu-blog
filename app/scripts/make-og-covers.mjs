/**
 * 为分享卡片生成 og 封面：原图统一裁成 1200×630 横图（1.91:1）。
 *
 * 原图比例各异（1200×674 / 1200×1600 / 1024×1024），直接交给微信会被
 * 居中裁切且主体容易切掉。这里等比放大到盖满画布再居中裁，铺满不变形。
 *
 * 输出到 dist/og/（构建后调用），不进 public/：避免生成物污染源目录。
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

  // cover 缩放：短边也盖住画布
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
 * 为每篇文章的原图生成 og 封面，按原图名去重
 * （featured-1.jpg 被两篇共用，应只裁一次、共享同一文件）。
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