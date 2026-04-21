import { useEffect, useRef } from 'react'

export default function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const isHoveringRef = useRef(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.targetX = e.clientX
      posRef.current.targetY = e.clientY
    }

    const animate = () => {
      const pos = posRef.current
      pos.x += (pos.targetX - pos.x) * 0.15
      pos.y += (pos.targetY - pos.y) * 0.15

      if (cursor) {
        const size = isHoveringRef.current ? 40 : 8
        const offset = size / 2
        cursor.style.transform = `translate(${pos.x - offset}px, ${pos.y - offset}px)`
        cursor.style.width = `${size}px`
        cursor.style.height = `${size}px`
        cursor.style.backgroundColor = isHoveringRef.current ? 'transparent' : 'var(--color-ink)'
        cursor.style.border = isHoveringRef.current ? '1px solid var(--color-ink)' : 'none'
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', handleMouseMove)

    const hoverElements = document.body
    hoverElements.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement
      if (target.closest('.cursor-hover, a, button')) {
        isHoveringRef.current = true
      }
    })
    hoverElements.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement
      if (target.closest('.cursor-hover, a, button')) {
        isHoveringRef.current = false
      }
    })

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-ink)',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'width 0.3s ease, height 0.3s ease, background-color 0.3s ease, border 0.3s ease',
        mixBlendMode: 'difference',
      }}
    />
  )
}
