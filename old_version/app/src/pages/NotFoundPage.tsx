import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '24px',
      backgroundColor: 'var(--color-bg)',
      padding: '40px',
    }}>
      <span className="badge-month" style={{ display: 'block', marginBottom: '8px' }}>
        404
      </span>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(32px, 5vw, 56px)',
        fontWeight: 300,
        color: 'var(--color-text)',
        letterSpacing: '0.04em',
        margin: 0,
      }}>
        页面未找到
      </h1>
      <p style={{
        fontFamily: "'Crimson Pro', 'Noto Serif SC', serif",
        fontSize: '16px',
        color: 'var(--color-text-muted)',
        lineHeight: 1.7,
        maxWidth: '400px',
        textAlign: 'center',
      }}>
        你寻找的页面可能已被移动、删除，或者从未存在过。
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginTop: '8px',
          padding: '12px 28px',
          border: '1px solid var(--color-accent)',
          fontFamily: 'var(--font-display)',
          fontSize: '13px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-accent)'
          e.currentTarget.style.color = 'var(--color-bg)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--color-accent)'
        }}
      >
        返回首页
      </Link>
    </div>
  )
}
