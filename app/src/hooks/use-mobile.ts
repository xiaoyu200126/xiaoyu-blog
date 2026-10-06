import * as React from "react"

/**
 * 三档断点。
 *
 * 原先只有一个 `useIsMobile()`（767px 一个布尔值），导致 768–1100px 的平板
 * 区间完全没有适配：走的是桌面双栏布局，但宽度不够，标题挤成三四行、
 * 留白全部塌掉。而组件里只有 `isMobile ? A : B` 二选一，也表达不了
 * 「平板要保留双栏、只调比例」这种需求。
 *
 * 档位划分：
 *   mobile   ≤ 480px    单栏，上图下文
 *   tablet   481–1023px 保留桌面双栏构图，只调比例与留白
 *   desktop  ≥ 1024px   现状
 */
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 1023,
} as const

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

function resolve(width: number): Breakpoint {
  if (width <= BREAKPOINTS.mobile) return 'mobile'
  if (width <= BREAKPOINTS.tablet) return 'tablet'
  return 'desktop'
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = React.useState<Breakpoint>('desktop')

  React.useEffect(() => {
    const onChange = () => setBp(resolve(window.innerWidth))
    onChange()
    window.addEventListener('resize', onChange)
    return () => window.removeEventListener('resize', onChange)
  }, [])

  return bp
}

/**
 * 布局分支判定：< 768px 走「上图下文卡片流」，≥ 768px 走桌面双栏轮播。
 *
 * 注意这个阈值与 useBreakpoint 的视觉档位是**两件不同的事**，不能合并：
 * 768–480 之间若按 480 判成手机分支，481–767px 就会掉进桌面 Flickity
 * 双栏，两列各 300px，比原来更挤。布局复杂度看的是宽度是否够放双栏，
 * 视觉排版才用三档细分。
 */
const LAYOUT_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const onChange = () => setIsMobile(window.innerWidth < LAYOUT_BREAKPOINT)
    onChange()
    window.addEventListener('resize', onChange)
    return () => window.removeEventListener('resize', onChange)
  }, [])

  return isMobile
}

/** 窄屏（≤480px）——用于满出血、去留白这类针对性调整 */
export function useIsNarrow() {
  return useBreakpoint() === 'mobile'
}

/** 平板（481–1023px）：保留双栏构图，只调比例与留白 */
export function useIsTablet() {
  return useBreakpoint() === 'tablet'
}
