import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(72px, 10vw, 120px) 40px 0',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {/* 落款 —— 原来这里是「订阅 RSS」。RSS 本身仍在运行，但它是给少数人的工具，
          不该占掉页脚最显眼的位置；降级为导航行里的小字链接，见下。 */}
      <div
        className="footer-signoff"
        style={{
          textAlign: 'center',
          maxWidth: '560px',
          width: '100%',
          marginBottom: 'clamp(56px, 8vw, 88px)',
        }}
      >
        {/* 居中的短横线：落款的视觉锚点。不用通栏分隔线，
            那样会和 footer 顶边那条 border 打架，视觉上像两条线。 */}
        <div
          aria-hidden="true"
          style={{
            width: '32px',
            height: '1px',
            backgroundColor: 'var(--color-accent)',
            opacity: 0.5,
            margin: '0 auto',
            marginBottom: '32px',
          }}
        />

        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(19px, 2.2vw, 26px)',
            fontWeight: 400,
            color: 'var(--color-text)',
            letterSpacing: '0.02em',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          记录发生过的事、遇见过的人、去过的地方
        </p>

        {/* 署名与年份分列两端。堆叠成两行更像版权声明，
            左右分开才有「落款」的重量感。 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            maxWidth: '280px',
            margin: '0 auto',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '11px',
              fontWeight: 400,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            XIAOYU
          </span>
          <span
            style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              letterSpacing: '0.12em',
              opacity: 0.7,
            }}
          >
            {new Date().getFullYear()}
          </span>
        </div>
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

      {/* 版权行 —— 署名与年份已在落款里出现过，这里不重复。 */}
      <div style={{ textAlign: 'center', padding: '20px 40px 40px' }}>
        <p
          style={{
            fontFamily: "'Crimson Pro', 'Noto Serif SC', serif",
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.06em',
            opacity: 0.6,
            margin: 0,
          }}
        >
          均为原创，请勿转载
          <span style={{ margin: '0 10px', opacity: 0.5 }}>·</span>
          {/* RSS 从主视觉降级到这里：feed.xml 仍在正常生成，链接照常可用，
              只是不再占据页脚最显眼的位置。 */}
          <a
            href="/feed.xml"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
          >
            RSS
          </a>
        </p>
      </div>
    </footer>
  )
}
