import { Link } from 'react-router-dom'
import { useIsMobile } from '../hooks/use-mobile'

interface HeaderProps {
  onMenuClick: () => void
  menuOpen: boolean
}

export default function Header({ onMenuClick, menuOpen }: HeaderProps) {
  const isMobile = useIsMobile()

  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        padding: isMobile ? '28px 20px' : '28px clamp(20px, 3.5vw, 60px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
      }}
    >
      <Link
        to="/"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          fontWeight: 600,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'var(--color-text)',
          textDecoration: 'none',
          transition: 'color 0.3s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text)' }}
      >
        XIAOYU
      </Link>

      <button
        onClick={onMenuClick}
        aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
        style={{
          background: 'none',
          border: 'none',
          width: '32px',
          height: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            display: 'block',
            width: '100%',
            height: '2px',
            borderRadius: '1px',
            backgroundColor: 'var(--color-text)',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transformOrigin: 'center',
            ...(menuOpen ? { transform: 'translateY(11px) rotate(45deg)' } : {}),
          }}
        />
        <span
          style={{
            display: 'block',
            width: '100%',
            height: '2px',
            borderRadius: '1px',
            backgroundColor: 'var(--color-text)',
            transition: 'opacity 0.3s ease',
            opacity: menuOpen ? 0 : 1,
          }}
        />
        <span
          style={{
            display: 'block',
            width: '100%',
            height: '2px',
            borderRadius: '1px',
            backgroundColor: 'var(--color-text)',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transformOrigin: 'center',
            ...(menuOpen ? { transform: 'translateY(-11px) rotate(-45deg)' } : {}),
          }}
        />
      </button>
    </header>
  )
}
