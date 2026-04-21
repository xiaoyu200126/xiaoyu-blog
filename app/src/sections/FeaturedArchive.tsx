import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

const articles = [
  {
    id: 1,
    number: '01',
    title: '墨香与光影的对话',
    excerpt: '在一间光线昏暗的老屋里，阳光透过雕花木窗，将细碎的光斑洒在摊开的稿纸上。钢笔尖划过纸面的沙沙声，是这个喧嚣世界里最后的安静仪式。我们用镜头记录下这些被遗忘的角落，用文字留住即将消逝的温度。',
    image: '/images/featured-1.jpg',
    date: '2024.10',
    category: '随笔',
  },
  {
    id: 2,
    number: '02',
    title: '旷野中的独白者',
    excerpt: '大雾弥漫的清晨，一个人站在无边无际的荒原上。远处没有终点，身后没有来路。这样的时刻，人与天地融为一体，所有的焦虑与不安都被这片辽阔吞噬。摄影是孤独的修行，每一次按下快门，都是与自己内心的对话。',
    image: '/images/featured-2.jpg',
    date: '2024.09',
    category: '摄影手记',
  },
  {
    id: 3,
    number: '03',
    title: '时间的褶皱',
    excerpt: '老照片的魅力在于它们承载了太多无法言说的故事。一张泛黄的合影，一封从未寄出的信件，一本页脚卷起的旧书。这些物件静静躺在时光深处，等待有缘人将它们从遗忘中打捞出来，重新赋予生命。',
    image: '/images/featured-1.jpg',
    date: '2024.08',
    category: '时光碎片',
  },
]

export default function FeaturedArchive() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const triggers: ScrollTrigger[] = []

    itemRefs.current.forEach((item) => {
      if (!item) return

      const textCol = item.querySelector('.text-col')
      const imgCol = item.querySelector('.img-col')

      if (textCol) {
        const st = gsap.fromTo(
          textCol,
          { y: 80 },
          {
            y: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        )
        if (st.scrollTrigger) triggers.push(st.scrollTrigger)
      }

      if (imgCol) {
        const st = gsap.fromTo(
          imgCol,
          { y: -40 },
          {
            y: 30,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        )
        if (st.scrollTrigger) triggers.push(st.scrollTrigger)
      }
    })

    return () => {
      triggers.forEach((st) => st.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        padding: 'clamp(80px, 12vw, 160px) 0',
        backgroundColor: 'var(--color-base)',
      }}
    >
      {/* Section label */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 40px',
          marginBottom: 'clamp(60px, 8vw, 100px)',
        }}
      >
        <span
          className="font-inter"
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-light)',
          }}
        >
          Featured Archive
        </span>
        <h2
          className="font-serif"
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 400,
            marginTop: '16px',
            letterSpacing: '0.05em',
            color: 'var(--color-ink)',
          }}
        >
          纵览：墨香长廊
        </h2>
      </div>

      {/* Articles */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {articles.map((article, index) => (
          <div
            key={article.id}
            ref={(el) => {
              if (el) itemRefs.current[index] = el
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: index % 2 === 0 ? '1fr 1.2fr' : '1.2fr 1fr',
              gap: 'clamp(40px, 6vw, 80px)',
              alignItems: 'center',
              marginBottom: index < articles.length - 1 ? 'clamp(80px, 12vw, 140px)' : 0,
            }}
          >
            {/* Text column */}
            <div
              className="text-col"
              style={{
                order: index % 2 === 0 ? 1 : 2,
              }}
            >
              <span
                className="font-display"
                style={{
                  fontSize: 'clamp(4rem, 8vw, 7rem)',
                  fontWeight: 400,
                  lineHeight: 1,
                  color: 'var(--color-ink-light)',
                  opacity: 0.25,
                  display: 'block',
                  marginBottom: '20px',
                }}
              >
                {article.number}
              </span>
              <span
                className="font-inter"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-ink-light)',
                  display: 'block',
                  marginBottom: '12px',
                }}
              >
                {article.date} · {article.category}
              </span>
              <h3
                className="font-serif"
                style={{
                  fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                  fontWeight: 700,
                  lineHeight: 1.4,
                  marginBottom: '20px',
                  color: 'var(--color-ink)',
                }}
              >
                {article.title}
              </h3>
              <p
                className="font-sans"
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.8,
                  color: 'var(--color-ink-light)',
                  maxWidth: '420px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: '28px',
                }}
              >
                {article.excerpt}
              </p>
              <Link
                to="#"
                className="cursor-hover font-inter"
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-ink)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--color-ink)',
                  paddingBottom: '4px',
                  transition: 'color 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-cmyk-red)'
                  e.currentTarget.style.borderColor = 'var(--color-cmyk-red)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-ink)'
                  e.currentTarget.style.borderColor = 'var(--color-ink)'
                }}
              >
                阅读全文
              </Link>
            </div>

            {/* Image column */}
            <div
              className="img-col"
              style={{
                order: index % 2 === 0 ? 2 : 1,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '100%',
                  paddingBottom: '65%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={article.image}
                  alt={article.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'saturate(0.85)',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
