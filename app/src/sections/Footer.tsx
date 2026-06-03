import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('xiaoyu_blog_subscribed')
    if (saved === 'true') {
      setSubscribed(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      localStorage.setItem('xiaoyu_blog_subscribed', 'true')
      localStorage.setItem('xiaoyu_blog_subscriber_email', email.trim())
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer
      style={{
        position: 'relative',
        minHeight: '50vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'clamp(60px, 8vw, 100px) 40px',
        borderTop: '1px solid var(--color-border)',
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
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(20px, 2vw, 28px)',
            fontWeight: 700,
            marginBottom: '12px',
            color: 'var(--color-text)',
            letterSpacing: '0.05em',
          }}
        >
          让我们成为追求智慧路上的伙伴
        </h3>
        <p
          style={{
            fontFamily: "'Crimson Pro', 'Noto Serif SC', serif",
            fontSize: '15px',
            color: 'var(--color-text-muted)',
            marginBottom: '36px',
            lineHeight: 1.6,
          }}
        >
          输入邮箱以订阅更新提醒（仅本地记录）
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${subscribed ? 'var(--color-accent)' : 'var(--color-border-light)'}`,
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
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              padding: '12px 0',
              fontSize: '14px',
              fontFamily: "'Crimson Pro', serif",
              color: 'var(--color-text)',
              letterSpacing: '0.02em',
            }}
          />
          <button
            type="submit"
            disabled={subscribed}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '12px',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: subscribed ? 'var(--color-accent)' : 'var(--color-text)',
              padding: '12px 0 12px 16px',
              transition: 'color 0.3s ease',
              cursor: 'pointer',
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
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0',
          padding: '30px 40px',
          borderTop: '1px solid var(--color-border)',
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: '首页', path: '/' },
          { label: '精选文章', path: '/archives' },
          { label: '生活碎碎念', path: '/life' },
          { label: '实用主义&关联主义', path: '/pragmatism-connectivism' },
          { label: 'BRAND & AI', path: '/brand-ai' },
          { label: '晓宇友人账', path: '/friends' },
          { label: '关于晓宇', path: '/about' },
        ].map((item, index, arr) => (
          <span key={item.path} style={{ display: 'flex', alignItems: 'center' }}>
            <Link
              to={item.path}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
                padding: '8px 14px',
                transition: 'color 0.3s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
            >
              {item.label}
            </Link>
            {index < arr.length - 1 && (
              <span style={{ color: 'var(--color-border-light)', fontSize: '12px' }}>|</span>
            )}
          </span>
        ))}
      </div>

      {/* Copyright */}
      <div style={{ textAlign: 'center', padding: '20px 40px 40px' }}>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '11px',
            fontWeight: 400,
            color: 'var(--color-text-muted)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          XIAOYU &copy; {new Date().getFullYear()} THOUGHT & NOTES
        </p>
        <p
          style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.02em',
            marginTop: '8px',
            opacity: 0.6,
          }}
        >
          均为原创，请勿转载
        </p>
      </div>
    </footer>
  )
}
