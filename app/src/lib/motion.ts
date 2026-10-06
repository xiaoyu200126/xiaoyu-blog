/**
 * 动效门 —— 让 GSAP 尊重系统的「减少动态效果」设置。
 *
 * 问题：`@media (prefers-reduced-motion: reduce)` 只对 CSS 动画/过渡有效。
 * GSAP 是 JS 直接写 inline style，完全不受 CSS 媒体查询约束 ——
 * 开启「减少动态效果」的用户，CSS 动画停了，GSAP 的位移与淡入照跑。
 *
 * 做法：在包装层拦截 fromTo/to/from，开启减少动态效果时**直接落到终态**
 * （内容立刻可见、没有任何位移），而不是干脆不执行（那会让内容永久隐形）。
 *
 * 用法：把 `import { gsap } from 'gsap'` 换成
 * `import { gsap } from '../lib/motion'`，调用点一行都不用改。
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
