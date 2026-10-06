import { Link } from 'react-router-dom'

export default function Footer() {
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
        className="footer-subscribe"
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
            marginBottom: '32px',
            lineHeight: 1.7,
          }}
        >
          新文章发布时，订阅 RSS，第一时间送到你的阅读器。
        </p>

        {/* 原来这里是一个「输入邮箱订阅更新提醒」的表单：提交后只写进
            localStorage，既不发送邮件也不做任何后续动作，却显示「订阅成功」。
            那是个不产生任何结果的入口，还会收集一个毫无用途的邮箱。
            换成 RSS —— 博客读者真正需要的更新方式，且不需要后端。 */}
        <a
          href="/feed.xml"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 26px',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            letterSpacing: '0.15em',
            transition: 'border-color 0.3s ease, color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)'
            e.currentTarget.style.color = 'var(--color-accent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)'
            e.currentTarget.style.color = 'var(--color-text)'
          }}
        >
          订阅 RSS
        </a>
      </div>

      {/* Footer links —— 手机端改用两列网格。
          原来是一条 flex 链 + 「|」分隔符，375px 下每个链接一行竖排，
          7 个链接把页脚撑得很长。窄屏改两列后高度减半，且不再需要分隔线。 */}
      <div
        className="footer-nav"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0',
          padding: '30px 40px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {[
          { label: '首页', path: '/' },
          { label: '生活碎碎念', path: '/life' },
          { label: '思考随笔', path: '/pragmatism-connectivism' },
          { label: 'BRAND & AI', path: '/brand-ai' },
          { label: '晓宇友人账', path: '/friends' },
          { label: '关于XIAOYU', path: '/about' },
          { label: '精选文章', path: '/archives' },
        ].map((item, index, arr) => (
          <span className="footer-nav-item" key={item.path}>
            <Link
              to={item.path}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
                padding: '10px 14px',
                display: 'block',
                transition: 'color 0.3s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
            >
              {item.label}
            </Link>
            {index < arr.length - 1 && (
              <span className="footer-nav-sep" style={{ color: 'var(--color-border-light)', fontSize: '12px' }}>|</span>
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
