import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const articles = [
  { id: 1, title: '关联主义的思维方式', date: '2024年10月22日', excerpt: '知识不再是孤立的岛屿，而是相互连接的群岛。当我们学习新事物时，最重要的是找到它与已有知识的连接点。' },
  { id: 2, title: '效率工具狂魔的自我修养', date: '2024年10月5日', excerpt: '试用过上百款效率工具后，我发现最重要的不是工具本身，而是持续使用同一套系统的耐心。' },
  { id: 3, title: '笔记系统的进化史', date: '2024年9月14日', excerpt: '从纸质笔记本到 Notion，从 Roam Research 到 Obsidian。我的笔记系统经历了五代更迭。' },
  { id: 4, title: '为什么我需要第二大脑', date: '2024年8月30日', excerpt: '大脑是用来产生想法的，不是用来存储信息的。当外接存储足够可靠，思维才能获得真正的自由。' },
  { id: 5, title: '极简主义的工具观', date: '2024年8月12日', excerpt: '工具越少，摩擦力越小。真正的高效来自于对少数工具的深度掌握，而非对大量工具的浅尝辄止。' },
]

export default function PragmatismPage() {
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
          Pragmatism & Connectivism
        </span>
        <h1 className="font-serif" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 700, lineHeight: 1.3, marginBottom: '60px', color: 'var(--color-ink)', letterSpacing: '0.02em' }}>
          实用主义 & 关联主义
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
