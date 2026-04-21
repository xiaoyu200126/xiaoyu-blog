import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const friends = [
  { id: 1, name: '陈默', title: '独立摄影师', link: '#', description: '用镜头记录城市边缘的诗意，擅长黑白胶片摄影。' },
  { id: 2, name: '林小雨', title: '文字工作者 / 译者', link: '#', description: '翻译过多本日文小说，正在写自己的第一本散文集。' },
  { id: 3, name: '阿北', title: '全栈开发者', link: '#', description: '开源社区活跃贡献者，相信技术应该服务于人文。' },
  { id: 4, name: '苏苏', title: '插画师', link: '#', description: '用水彩和数字画笔描绘梦境与现实交织的世界。' },
  { id: 5, name: '老周', title: '咖啡馆主理人', link: '#', description: '经营一家开了八年的独立咖啡馆，也是地下乐队的鼓手。' },
  { id: 6, name: '阿雅', title: '旅行博主', link: '#', description: '走过四十个国家，用文字和影像记录路上的故事。' },
]

export default function FriendsPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<HTMLElement[]>([])

  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    gsap.fromTo(content, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 })
    const items = itemRefs.current.filter(Boolean)
    if (items.length > 0) {
      gsap.fromTo(items, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.5 })
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', paddingTop: '140px', paddingBottom: '80px', backgroundColor: '#fff' }}>
      <div ref={contentRef} style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block', marginBottom: '24px' }}>
          Friends
        </span>
        <h1 className="font-serif" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 700, lineHeight: 1.3, marginBottom: '16px', color: 'var(--color-ink)', letterSpacing: '0.02em' }}>
          晓宇的朋友们
        </h1>
        <p style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.8, color: 'var(--color-ink-light)', marginBottom: '60px' }}>
          这里有我认识的一些有趣的人，他们各自在自己的领域里发光。点击名字可以访问他们的主页。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {friends.map((friend, i) => (
            <a
              key={friend.id}
              href={friend.link}
              ref={(el) => { if (el) itemRefs.current[i] = el }}
              className="cursor-hover"
              style={{
                display: 'block',
                padding: '28px',
                border: '1px solid var(--color-border)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-cmyk-red)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <h3 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px', color: 'var(--color-ink)' }}>
                {friend.name}
              </h3>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', color: 'var(--color-cmyk-red)', display: 'block', marginBottom: '12px' }}>
                {friend.title}
              </span>
              <p style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '0.85rem', fontWeight: 400, lineHeight: 1.7, color: 'var(--color-ink-light)' }}>
                {friend.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
