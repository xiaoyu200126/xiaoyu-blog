import { useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getArticleById, articles } from '../data/articles'
import { Calendar, Clock, ArrowLeft, Share2, Tag } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

gsap.registerPlugin(ScrollTrigger)

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const article = getArticleById(id || '')
  const contentRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!article) return

    window.scrollTo(0, 0)

    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.hero-animate'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
      )
    }

    if (contentRef.current) {
      const paragraphs = contentRef.current.querySelectorAll('p, h2, h3, ul, ol, blockquote')
      gsap.fromTo(
        paragraphs,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
          },
        }
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [article])

  useEffect(() => {
    if (!article) return

    const updateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    updateMeta('og:title', article.title)
    updateMeta('og:description', article.excerpt)
    updateMeta('og:image', window.location.origin + article.image)
    updateMeta('og:url', window.location.href)
    updateMeta('og:type', 'article')
    updateMeta('og:author', article.author)
    updateMeta('og:site_name', 'XIAOYU的随笔')
    updateMeta('og:locale', 'zh_CN')

    document.title = `${article.title} — XIAOYU的随笔`

    return () => {
      document.title = 'XIAOYU的随笔'
    }
  }, [article])

  const handleShare = async () => {
    const shareData = {
      title: article?.title || 'XIAOYU的随笔',
      text: article?.excerpt || '',
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('链接已复制到剪贴板')
      } catch {
        alert('请手动复制链接分享')
      }
    }
  }

  if (!article) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', backgroundColor: 'var(--color-bg)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-text)' }}>文章未找到</h1>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            border: '1px solid var(--color-accent)',
            background: 'transparent',
            fontFamily: 'var(--font-display)',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--color-accent)',
          }}
        >
          返回首页
        </button>
      </div>
    )
  }

  const relatedArticles = articles
    .filter((a) => a.id !== article.id && a.tags.some((t) => article.tags.includes(t)))
    .slice(0, 2)

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Hero */}
      <div
        ref={heroRef}
        style={{
          position: 'relative',
          height: '60vh',
          minHeight: '400px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${article.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.5)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(15,15,15,0.2) 0%, rgba(15,15,15,0.8) 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '48px',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <div className="hero-animate" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {article.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-accent)',
                  padding: '4px 10px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <h1
            className="hero-animate"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 300,
              color: '#fff',
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            {article.title}
          </h1>
          <div
            className="hero-animate"
            style={{ display: 'flex', gap: '24px', color: 'var(--color-text-secondary)', fontSize: '13px', flexWrap: 'wrap', fontFamily: 'var(--font-body)' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              {article.date}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              {article.readTime}
            </span>
            <span style={{ color: 'var(--color-accent)' }}>by {article.author}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 24px' }}>
        {/* Back & Share */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '48px',
            paddingBottom: '24px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            <ArrowLeft size={16} />
            返回
          </button>
          <button
            onClick={handleShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-accent)',
              padding: '10px 20px',
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              cursor: 'pointer',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            <Share2 size={14} />
            分享
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="article-content"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
        </div>

        {/* Tags */}
        <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Tag size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>标签</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {article.tags.map((tag) => (
              <Link
                key={tag}
                to={`/archives?tag=${tag}`}
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  padding: '6px 14px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)'
                  e.currentTarget.style.color = 'var(--color-accent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.color = 'var(--color-text-muted)'
                }}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div style={{ marginTop: '64px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: 300,
                marginBottom: '32px',
                color: 'var(--color-text)',
              }}
            >
              相关文章
            </h3>
            <div style={{ display: 'grid', gap: '24px' }}>
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/article/${related.id}`}
                  style={{
                    display: 'flex',
                    gap: '20px',
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '20px',
                    border: '1px solid var(--color-border)',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                  }}
                >
                  <div
                    style={{
                      width: '120px',
                      height: '80px',
                      flexShrink: 0,
                      backgroundImage: `url(${related.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '4px',
                    }}
                  />
                  <div>
                    <h4
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '16px',
                        fontWeight: 400,
                        marginBottom: '8px',
                        color: 'var(--color-text)',
                      }}
                    >
                      {related.title}
                    </h4>
                    <p style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{related.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
