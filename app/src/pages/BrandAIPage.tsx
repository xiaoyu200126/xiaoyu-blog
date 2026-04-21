import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const articles = [
  { id: 1, title: 'ALL IN AI：我的转型之路', date: '2024年11月1日', excerpt: '从传统设计师到 AI 驱动创作者，这个过程比想象中更艰难，也比想象中更 rewarding。' },
  { id: 2, title: '品牌设计中的 AI 工作流', date: '2024年10月15日', excerpt: 'Midjourney 出概念、Figma 做精修、AI 文案助手写 slogan。我的人机协作流程已经跑通。' },
  { id: 3, title: '为什么品牌需要拥抱 AI', date: '2024年9月28日', excerpt: 'AI 不是品牌的威胁，而是放大器。懂得使用 AI 的品牌，将在内容生产的效率和创意维度上获得指数级优势。' },
  { id: 4, title: 'AI 时代的设计师角色重构', date: '2024年9月10日', excerpt: '当 AI 能画出精美的插图，设计师的价值转向哪里？答案是：策略、叙事和人机协作的编排能力。' },
  { id: 5, title: 'BRAND 笔记：从 0 到 1 打造个人品牌', date: '2024年8月22日', excerpt: '个人品牌不是包装出来的，而是做出来的时候顺便被看到的。先做事，再讲故事。' },
]

export default function BrandAIPage() {
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
          BRAND & ALL IN AI
        </span>
        <h1 className="font-serif" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 700, lineHeight: 1.3, marginBottom: '60px', color: 'var(--color-ink)', letterSpacing: '0.02em' }}>
          品牌与 AI 实践
        </h1>
        <div>
          {articles.map((article, i) => (
            <div key={article.id} ref={(el) => { if (el) itemRefs.current[i] = el }} style={{ borderBottom: '1px solid var(--color-border)', padding: '32px 0' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: '12px' }}>
                {article.date}
              </span>
              <h2 className="font-serif cursor-hover" style={{ fontSize: 'clamp(1.15rem, 2vw, 1.4rem)', fontWeight: 700, lineHeight: 1.4, marginBottom: '12px', color: 'var(--color-ink)', transition: 'color 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-cmyk-red)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}>
                {article.title}
              </h2>
              <p style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.8, color: 'var(--color-ink-light)' }}>
                {article.excerpt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
