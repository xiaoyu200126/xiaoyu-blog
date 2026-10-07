import { useEffect, useRef } from 'react'

/**
 * 磁性光标 —— 只作 hover 提示，不替代系统光标。
 *
 * 三条别再踩的：CSS 里不得用 `* { cursor: none }`（正文无法选字）；
 * rAF 不得常驻（静止 700ms 停机，否则每帧强制重算）；
 * mouseover/out 必须在 cleanup 里解绑，否则路由切换持续累积。
 */
export default function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: -100, y: -100, targetX: -100, targetY: -100, visible: false })
  const hoveringRef = useRef(false)
  const rafRef = useRef<number>(0)
  const idleTimerRef = useRef<number>(0)

  useEffect(() => {
    // Skip on mobile / touch — let native cursor handle
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const isTouch = 'ontouchstart' in window
    if (isMobile || isTouch) return

    const cursor = cursorRef.current
    if (!cursor) return

    const HOVER_SELECTOR = '.cursor-hover, a, button, input, textarea, select, [role="button"]'
    const IDLE_STOP_MS = 700

    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element && target.closest(HOVER_SELECTOR) !== null

    // 只有在指针「接近目标」时才真正写入样式，避免每帧无谓重绘
    const render = () => {
      const pos = posRef.current
      const dx = pos.targetX - pos.x
      const dy = pos.targetY - pos.y
      pos.x += dx * 0.18
      pos.y += dy * 0.18

      if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
        pos.x = pos.targetX
        pos.y = pos.targetY
      } else {
        rafRef.current = requestAnimationFrame(render)
      }

      const size = hoveringRef.current ? 40 : 14
      const offset = size / 2
      cursor.style.transform = `translate(${pos.x - offset}px, ${pos.y - offset}px)`
      cursor.style.width = `${size}px`
      cursor.style.height = `${size}px`
    }

    const wake = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(render)
      window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = window.setTimeout(() => {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }, IDLE_STOP_MS)
    }

    const show = () => {
      posRef.current.visible = true
      cursor.style.opacity = '1'
    }

    const hide = () => {
      posRef.current.visible = false
      cursor.style.opacity = '0'
    }

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.targetX = e.clientX
      posRef.current.targetY = e.clientY
      show()
      wake()
    }

    const handleOver = (e: MouseEvent) => {
      const next = isInteractive(e.target)
      if (next === hoveringRef.current) return
      hoveringRef.current = next
      cursor.style.backgroundColor = next ? 'transparent' : '#fff'
      cursor.style.border = next ? '1px solid var(--color-ink)' : 'none'
      wake()
    }

    const handleOut = (e: MouseEvent) => {
      if (!isInteractive(e.target)) return
      // 移到另一个可交互元素上时不算离开，交给 over 处理
      const to = e.relatedTarget
      if (to instanceof Element && to.closest(HOVER_SELECTOR)) return
      hoveringRef.current = false
      cursor.style.backgroundColor = '#fff'
      cursor.style.border = 'none'
      wake()
    }

    const handleLeaveWindow = () => {
      hide()
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      window.clearTimeout(idleTimerRef.current)
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseover', handleOver, true)
    document.addEventListener('mouseout', handleOut, true)
    document.addEventListener('mouseleave', handleLeaveWindow)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleOver, true)
      document.removeEventListener('mouseout', handleOut, true)
      document.removeEventListener('mouseleave', handleLeaveWindow)
      cancelAnimationFrame(rafRef.current)
      window.clearTimeout(idleTimerRef.current)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        borderRadius: '50%',
        backgroundColor: '#fff',
        pointerEvents: 'none',
        mixBlendMode: 'difference',
        // 静止时淡出，不再一直挂在屏幕上抢注意力
        opacity: 0,
        transition: 'opacity 0.25s ease, width 0.25s ease, height 0.25s ease',
        willChange: 'transform',
      }}
    />
  )
}
