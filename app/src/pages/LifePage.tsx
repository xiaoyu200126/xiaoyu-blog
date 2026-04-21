import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const lifePosts = [
  { id: 1, title: '清晨五点半的闹钟', date: '2024年11月2日', excerpt: '闹钟响的时候，窗外还是一片深蓝。我习惯在被窝里再躺五分钟，听楼下清洁工扫地的沙沙声。' },
  { id: 2, title: '地铁里的阅读时光', date: '2024年10月18日', excerpt: '通勤的四十分钟是我一天中最专注的阅读时间。车厢摇晃，文字却格外清晰。' },
  { id: 3, title: '那家开了二十年的面馆', date: '2024年9月25日', excerpt: '老板娘记得每个熟客的口味。我不说，她也知道我要多放葱花不要香菜。' },
  { id: 4, title: '雨天的周末', date: '2024年9月8日', excerpt: '下雨天最适合整理旧物。翻出一摞十年前的明信片，上面的字迹已经有些模糊。' },
  { id: 5, title: '深夜便利店的温暖', date: '2024年8月20日', excerpt: '凌晨两点的便利店是城市的灯塔。关东煮的热气，店员疲惫却友善的微笑。' },
]

export default function LifePage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    gsap.fromTo(content, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 })

    const items = itemRefs.current.filter(Boolean)
    if (items.length > 0) {
      gsap.fromTo(items, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.5 })
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', paddingTop: '140px', paddingBottom: '80px', backgroundColor: '#fff' }}>
      <div ref={contentRef} style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block', marginBottom: '24px' }}>
          Life Musings
        </span>

        <h1 className="font-serif" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 700, lineHeight: 1.3, marginBottom: '60px', color: 'var(--color-ink)', letterSpacing: '0.02em' }}>
          生活碎碎念
        </h1>

        <div>
          {lifePosts.map((post, i) => (
            <div key={post.id} ref={(el) => { if (el) itemRefs.current[i] = el }} style={{ borderBottom: '1px solid var(--color-border)', padding: '32px 0' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: '12px' }}>
                {post.date}
              </span>
              <h2 className="font-serif cursor-hover" style={{ fontSize: 'clamp(1.15rem, 2vw, 1.4rem)', fontWeight: 700, lineHeight: 1.4, marginBottom: '12px', color: 'var(--color-ink)', transition: 'color 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-cmyk-red)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}>
                {post.title}
              </h2>
              <p style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.8, color: 'var(--color-ink-light)' }}>
                {post.excerpt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
