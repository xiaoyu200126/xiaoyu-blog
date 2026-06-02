import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer
      style={{
        position: 'relative',
        backgroundColor: '#fff',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {/* Subscribe section */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '80px 40px 50px',
        }}
      >
        <h3
          className="font-serif"
          style={{
            fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)',
            fontWeight: 700,
            marginBottom: '40px',
            color: 'var(--color-ink)',
            letterSpacing: '0.02em',
            lineHeight: 1.4,
          }}
        >
          让我们成为追求智慧路上的伙伴
        </h3>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${subscribed ? 'var(--color-cmyk-red)' : 'var(--color-border)'}`,
            maxWidth: '420px',
            margin: '0 auto',
            transition: 'border-color 0.3s ease',
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={subscribed ? '订阅成功！' : 'your@email.com'}
            disabled={subscribed}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              padding: '14px 0',
              fontSize: '0.9rem',
              fontWeight: 400,
              color: 'var(--color-ink)',
              letterSpacing: '0.02em',
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <button
            type="submit"
            disabled={subscribed}
            className="cursor-hover"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: subscribed ? 'var(--color-cmyk-red)' : 'var(--color-ink)',
              padding: '14px 0 14px 20px',
              transition: 'color 0.3s ease',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {subscribed ? '已订阅' : '订阅'}
          </button>
        </form>
      </div>

      {/* Bottom nav with divider lines */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0',
          padding: '30px 40px',
          borderTop: '1px solid var(--color-border)',
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: '生活碎碎念', path: '/life' },
          { label: '实用主义研究', path: '/pragmatism' },
          { label: '关联主义学习', path: '/archives' },
          { label: 'BRAND & ALL IN AI', path: '/brand-ai' },
          { label: '关于晓宇', path: '/about' },
        ].map((item, index, arr) => (
          <span key={item.path} style={{ display: 'flex', alignItems: 'center' }}>
            <Link
              to={item.path}
              className="cursor-hover"
              style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: 'clamp(0.75rem, 1vw, 0.85rem)',
                fontWeight: 500,
                color: 'var(--color-muted)',
                textDecoration: 'none',
                padding: '8px 14px',
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)' }}
            >
              {item.label}
            </Link>
            {index < arr.length - 1 && (
              <span style={{ color: 'var(--color-border)', fontSize: '0.8rem' }}>|</span>
            )}
          </span>
        ))}
      </div>

      {/* Copyright */}
      <div style={{ textAlign: 'center', padding: '20px 40px 40px' }}>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.65rem',
            fontWeight: 400,
            color: 'var(--color-muted)',
            letterSpacing: '0.1em',
          }}
        >
          XIAOYU &copy; {new Date().getFullYear()} THOUGHT & NOTES
        </p>
      </div>
    </footer>
  )
}
