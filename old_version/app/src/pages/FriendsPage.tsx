import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const friends = [
  { id: 1, name: '陈默', title: '独立摄影师', description: '用镜头记录城市边缘的诗意，擅长黑白胶片摄影。' },
  { id: 2, name: '林小雨', title: '文字工作者 / 译者', description: '翻译过多本日文小说，正在写自己的第一本散文集。' },
  { id: 3, name: '阿北', title: '全栈开发者', description: '开源社区活跃贡献者，相信技术应该服务于人文。' },
  { id: 4, name: '苏苏', title: '插画师', description: '用水彩和数字画笔描绘梦境与现实交织的世界。' },
  { id: 5, name: '老周', title: '咖啡馆主理人', description: '经营一家开了八年的独立咖啡馆，也是地下乐队的鼓手。' },
  { id: 6, name: '阿雅', title: '旅行博主', description: '走过四十个国家，用文字和影像记录路上的故事。' },
]

export default function FriendsPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<HTMLDivElement[]>([])

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
    <div style={{ minHeight: '100vh', paddingTop: '140px', paddingBottom: '80px', backgroundColor: 'var(--color-bg)' }}>
      <div ref={contentRef} style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
        <span className="badge-month" style={{ display: 'block', marginBottom: '24px' }}>
          Friends
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 300, lineHeight: 1.3, marginBottom: '16px', color: 'var(--color-text)', letterSpacing: '0.04em' }}>
          晓宇友人账
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 400, lineHeight: 1.8, color: 'var(--color-text-secondary)', marginBottom: '60px', letterSpacing: '0.04em' }}>
          这里有我认识的一些有趣的人，他们各自在自己的领域里发光。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {friends.map((friend, i) => (
            <div
              key={friend.id}
              ref={(el) => { if (el) itemRefs.current[i] = el }}
              style={{
                padding: '28px',
                border: '1px solid var(--color-border)',
                transition: 'border-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, marginBottom: '4px', color: 'var(--color-text)' }}>
                {friend.name}
              </h3>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--color-accent)', display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>
                {friend.title}
              </span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 400, lineHeight: 1.7, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>
                {friend.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
