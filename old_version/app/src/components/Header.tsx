import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
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
        padding: '24px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background-color 0.4s ease',
        backgroundColor: scrolled ? 'rgba(244, 244, 242, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
      }}
    >
      <Link
        to="/"
        className="font-display cursor-hover"
        style={{
          fontSize: '1.1rem',
          fontWeight: 400,
          fontStyle: 'italic',
          letterSpacing: '0.15em',
          color: 'var(--color-ink)',
          textDecoration: 'none',
        }}
      >
        LUOBI PRESS
      </Link>

      <button
        onClick={onMenuClick}
        className="cursor-hover"
        aria-label="打开菜单"
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          padding: '8px',
        }}
      >
        <span style={{ display: 'block', width: '28px', height: '1.5px', backgroundColor: 'var(--color-ink)' }} />
        <span style={{ display: 'block', width: '20px', height: '1.5px', backgroundColor: 'var(--color-ink)' }} />
      </button>
    </header>
  )
}
