/**
 * 动效门 —— 让 GSAP 尊重系统「减少动态效果」设置。
 *
 * `prefers-reduced-motion` 只约束 CSS 动画，GSAP 直接写 inline style 不受限。
 * 这里拦截 fromTo/to/from：开启减少动态效果时直接落到终态（内容立即可见），
 * 而不是不执行（那会让内容永久隐形）。
 *
 * 用法：把 `import { gsap } from 'gsap'` 换成 `import { gsap } from '../lib/motion'`。
 */
import { gsap as realGsap } from 'gsap'

const mq =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null

/** 当前是否请求了「减少动态效果」 */
export function prefersReducedMotion(): boolean {
  return mq?.matches ?? false
}

/** 开启减少动态效果时，把终态直接写上去（保留 end 里的全部属性，去掉过程） */
function jumpToEnd(targets: unknown, end: unknown) {
  if (end && typeof end === 'object') {
    realGsap.set(targets as never, end as never)
  }
}

type FromTo = (
  targets: unknown,
  fromVars: Record<string, unknown>,
  toVars: Record<string, unknown>,
) => unknown

const fromTo: FromTo = (targets, fromVars, toVars) => {
  if (prefersReducedMotion()) {
    jumpToEnd(targets, toVars)
    return null
  }
  return realGsap.fromTo(targets as never, fromVars as never, toVars as never)
}

const to: FromTo = (targets, _from, toVars) => {
  if (prefersReducedMotion()) {
    jumpToEnd(targets, toVars)
    return null
  }
  return realGsap.to(targets as never, toVars as never)
}

const from: FromTo = (targets, fromVars, _toVars) => {
  if (prefersReducedMotion()) {
    // from 的终态就是 fromVars 本身
    jumpToEnd(targets, fromVars)
    return null
  }
  return realGsap.from(targets as never, fromVars as never)
}

export const gsap = {
  fromTo,
  to,
  from,
  set: (targets: unknown, vars: Record<string, unknown>) =>
    realGsap.set(targets as never, vars as never),
  killTweensOf: (targets: unknown) => realGsap.killTweensOf(targets as never),
  registerPlugin: (...plugins: unknown[]) =>
    (realGsap.registerPlugin as (...p: unknown[]) => unknown)(...plugins),
  timeline: (...args: unknown[]) => realGsap.timeline(...(args as [])),
  get core() {
    return realGsap.core
  },
  get version() {
    return realGsap.version
  },
}

export default gsap
