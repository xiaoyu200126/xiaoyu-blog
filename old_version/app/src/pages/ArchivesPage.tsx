import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

const archives = [
  { id: 1, title: '墨香与光影的对话', date: '2024.10.15', category: '随笔', readTime: '8 min read' },
  { id: 2, title: '旷野中的独白者', date: '2024.09.28', category: '摄影手记', readTime: '6 min read' },
  { id: 3, title: '时间的褶皱', date: '2024.08.12', category: '时光碎片', readTime: '5 min read' },
  { id: 4, title: '雨夜书简', date: '2024.07.03', category: '书信', readTime: '4 min read' },
  { id: 5, title: '山城漫步', date: '2024.06.18', category: '旅行', readTime: '10 min read' },
  { id: 6, title: '胶片的味道', date: '2024.05.22', category: '摄影手记', readTime: '7 min read' },
  { id: 7, title: '咖啡馆里的陌生人', date: '2024.04.10', category: '随笔', readTime: '6 min read' },
  { id: 8, title: '春天不是读书天', date: '2024.03.01', category: '随笔', readTime: '5 min read' },
  { id: 9, title: '老巷深处', date: '2024.02.14', category: '摄影手记', readTime: '8 min read' },
  { id: 10, title: '年末独白', date: '2024.01.01', category: '年度总结', readTime: '12 min read' },
]

export default function ArchivesPage() {
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const items = itemRefs.current.filter(Boolean)
    if (items.length === 0) return

    gsap.fromTo(
      items,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.3,
      }
    )
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '120px',
        paddingBottom: '80px',
        backgroundColor: 'var(--color-base)',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 40px',
        }}
      >
        <span
          className="font-inter"
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-light)',
            display: 'block',
            marginBottom: '24px',
          }}
        >
          Archives
        </span>

        <h1
          className="font-serif"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400,
            lineHeight: 1.3,
            marginBottom: '60px',
            color: 'var(--color-ink)',
            letterSpacing: '0.05em',
          }}
        >
          文章卷宗
        </h1>

        <div ref={listRef}>
          {archives.map((article, i) => (
            <div
              key={article.id}
              ref={(el) => {
                if (el) itemRefs.current[i] = el
              }}
              style={{
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                padding: '28px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '20px',
              }}
            >
              <div style={{ flex: 1 }}>
                <Link
                  to="#"
                  className="cursor-hover font-serif"
                  style={{
                    fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)',
                    fontWeight: 400,
                    lineHeight: 1.5,
                    color: 'var(--color-ink)',
                    textDecoration: 'none',
                    display: 'block',
                    marginBottom: '8px',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-cmyk-red)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-ink)'
                  }}
                >
                  {article.title}
                </Link>
                <span
                  className="font-inter"
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-ink-light)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {article.category}
                </span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span
                  className="font-inter"
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-ink-light)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {article.date}
                </span>
                <span
                  className="font-inter"
                  style={{
                    fontSize: '0.65rem',
                    color: 'rgba(136, 136, 136, 0.6)',
                  }}
                >
                  {article.readTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
