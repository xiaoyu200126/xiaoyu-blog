import * as React from "react"

/**
 * 三档视觉断点：mobile ≤480 / tablet 481–1023 / desktop ≥1024。
 * 平板保留桌面双栏构图，只调比例与留白。
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
 * 布局分支判定：<768 走「上图下文卡片流」，≥768 走桌面双栏轮播。
 *
 * 这个阈值与 useBreakpoint 的视觉档位是两件事，不能合并：按 480 判会把
 * 481–767px 推进桌面 Flickity 双栏，两列各 300px 比原来更挤。
 * 布局复杂度看宽度够不够放双栏，视觉排版才用三档细分。
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
