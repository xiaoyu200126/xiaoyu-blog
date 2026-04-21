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
        minHeight: '60vh',
        backgroundColor: 'var(--color-base)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'clamp(60px, 8vw, 100px) 40px',
      }}
    >
      {/* Subscribe section */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          marginBottom: 'clamp(60px, 8vw, 100px)',
        }}
      >
        <h3
          className="font-serif"
          style={{
            fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
            fontWeight: 400,
            marginBottom: '12px',
            color: 'var(--color-ink)',
            letterSpacing: '0.05em',
          }}
        >
          用订阅来感受"世界的参差"
        </h3>
        <p
          className="font-sans"
          style={{
            fontSize: '0.8rem',
            color: 'var(--color-ink-light)',
            marginBottom: '36px',
            lineHeight: 1.6,
          }}
        >
          输入电子邮箱，接收每期墨香
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${subscribed ? 'var(--color-cmyk-red)' : 'var(--color-ink-light)'}`,
            maxWidth: '400px',
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
            className="font-sans"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              padding: '12px 0',
              fontSize: '0.85rem',
              color: 'var(--color-ink)',
              letterSpacing: '0.05em',
            }}
          />
          <button
            type="submit"
            disabled={subscribed}
            className="cursor-hover font-inter"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: subscribed ? 'var(--color-cmyk-red)' : 'var(--color-ink)',
              padding: '12px 0 12px 16px',
              transition: 'color 0.3s ease',
            }}
          >
            {subscribed ? '已订阅' : '订阅'}
          </button>
        </form>
      </div>

      {/* Footer links */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
          maxWidth: '1200px',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          paddingTop: '30px',
        }}
      >
        {/* Left column */}
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <Link
            to="/"
            className="cursor-hover font-inter"
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-ink-light)',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-cmyk-red)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-ink-light)'
            }}
          >
            Home
          </Link>
          <Link
            to="/archives"
            className="cursor-hover font-inter"
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-ink-light)',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-cmyk-red)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-ink-light)'
            }}
          >
            Archives
          </Link>
          <Link
            to="/about"
            className="cursor-hover font-inter"
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-ink-light)',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-cmyk-red)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-ink-light)'
            }}
          >
            About
          </Link>
        </div>

        {/* Right column */}
        <div style={{ textAlign: 'right' }}>
          <p
            className="font-inter"
            style={{
              fontSize: '0.6rem',
              color: 'var(--color-ink-light)',
              letterSpacing: '0.1em',
              lineHeight: 1.8,
            }}
          >
            &copy; {new Date().getFullYear()} 落笔阁 LuoBi Press
          </p>
          <p
            className="font-inter"
            style={{
              fontSize: '0.6rem',
              color: 'rgba(136, 136, 136, 0.6)',
              letterSpacing: '0.05em',
            }}
          >
            均为原创，请勿转载
          </p>
        </div>
      </div>
    </footer>
  )
}
