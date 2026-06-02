import { useEffect, useState } from 'react'

interface HeaderProps {
  onMenuClick: () => void
  menuOpen: boolean
}

export default function Header({ onMenuClick, menuOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        padding: '28px 48px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        transition: 'background-color 0.4s ease',
        backgroundColor: scrolled && !menuOpen ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: scrolled && !menuOpen ? 'blur(8px)' : 'none',
        pointerEvents: 'none',
      }}
    >
      {/* Hamburger button - three equal lines with X animation */}
      <button
        onClick={onMenuClick}
        className="cursor-hover"
        aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
        style={{
          background: 'none',
          border: 'none',
          width: '32px',
          height: '24px',
          position: 'relative',
          pointerEvents: 'auto',
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: '2px',
            backgroundColor: 'var(--color-ink)',
            transition: 'transform 0.3s ease, top 0.3s ease',
            transform: menuOpen ? 'rotate(45deg)' : 'translateY(-8px)',
            top: '50%',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            width: '100%',
            height: '2px',
            backgroundColor: 'var(--color-ink)',
            transition: 'opacity 0.3s ease',
            opacity: menuOpen ? 0 : 1,
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: '2px',
            backgroundColor: 'var(--color-ink)',
            transition: 'transform 0.3s ease, top 0.3s ease',
            transform: menuOpen ? 'rotate(-45deg)' : 'translateY(6px)',
            top: '50%',
          }}
        />
      </button>
    </header>
  )
}
