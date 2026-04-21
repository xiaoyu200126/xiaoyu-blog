import { useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getArticleById, articles } from '../data/articles'
import { Calendar, Clock, ArrowLeft, Share2, Tag } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const article = getArticleById(id || '')
  const contentRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!article) return

    // Scroll to top
    window.scrollTo(0, 0)

    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.hero-animate'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
      )
    }

    // Content fade in
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

  // Update meta tags for sharing
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

    // WeChat specific
    updateMeta('og:site_name', '落笔阁 LuoBiGe')
    updateMeta('og:locale', 'zh_CN')

    document.title = `${article.title} — 落笔阁`

    return () => {
      document.title = '落笔阁 LuoBiGe'
    }
  }, [article])

  const handleShare = async () => {
    const shareData = {
      title: article?.title || '落笔阁',
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
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('链接已复制到剪贴板，可以粘贴到微信分享了')
      } catch {
        alert('请手动复制链接分享')
      }
    }
  }

  if (!article) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: '#1a1a1a' }}>文章未找到</h1>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            border: '1px solid #1a1a1a',
            background: 'transparent',
            fontFamily: 'var(--font-serif)',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          返回首页
        </button>
      </div>
    )
  }

  // Get related articles
  const relatedArticles = articles
    .filter((a) => a.id !== article.id && a.tags.some((t) => article.tags.includes(t)))
    .slice(0, 2)

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
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
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
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
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.3)',
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
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 400,
              color: '#fff',
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            {article.title}
          </h1>
          <div
            className="hero-animate"
            style={{ display: 'flex', gap: '24px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', flexWrap: 'wrap' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              {article.date}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              {article.readTime}
            </span>
            <span>{article.author}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px' }}>
        {/* Back & Share */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '48px',
            paddingBottom: '24px',
            borderBottom: '1px solid #eee',
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
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: '#666',
              cursor: 'pointer',
              letterSpacing: '1px',
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
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            <Share2 size={14} />
            分享到微信
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="article-content"
          dangerouslySetInnerHTML={{
            __html: formatMarkdown(article.content),
          }}
        />

        {/* Tags */}
        <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Tag size={16} color="#666" />
            <span style={{ fontSize: '13px', color: '#666', letterSpacing: '1px' }}>标签</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {article.tags.map((tag) => (
              <Link
                key={tag}
                to={`/?tag=${tag}`}
                style={{
                  fontSize: '12px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '6px 14px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#666'
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
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                fontWeight: 400,
                marginBottom: '32px',
                color: '#1a1a1a',
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
                    border: '1px solid #eee',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1a1a1a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#eee'
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
                    }}
                  />
                  <div>
                    <h4
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '16px',
                        fontWeight: 400,
                        marginBottom: '8px',
                        color: '#1a1a1a',
                      }}
                    >
                      {related.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>{related.excerpt}</p>
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

// Simple markdown to HTML converter
function formatMarkdown(md: string): string {
  return (
    md
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.+)$/gm, '<h3 style="font-family:var(--font-serif);font-size:20px;font-weight:400;margin:40px 0 16px;color:#1a1a1a;">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-family:var(--font-serif);font-size:24px;font-weight:400;margin:48px 0 20px;color:#1a1a1a;">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-family:var(--font-serif);font-size:32px;font-weight:400;margin:0 0 24px;color:#1a1a1a;">$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Blockquote
      .replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid #1a1a1a;padding-left:20px;margin:24px 0;color:#666;font-style:italic;">$1</blockquote>')
      // Lists
      .replace(/^- (.+)$/gm, '<li style="margin:8px 0;color:#333;">$1</li>')
      // Wrap lists
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="margin:16px 0;padding-left:20px;">$&</ul>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p style="font-family:var(--font-sans);font-size:16px;line-height:1.8;color:#333;margin:16px 0;">')
      // Wrap in p if not already
      .replace(/^(.+)$/gm, (match) => {
        if (match.startsWith('<')) return match
        return `<p style="font-family:var(--font-sans);font-size:16px;line-height:1.8;color:#333;margin:16px 0;">${match}</p>`
      })
      // Fix double wrapping
      .replace(/<p[^>]*><(h[123]|ul|blockquote)/g, '<$1')
      .replace(/<\/(h[123]|ul|blockquote)><\/p>/g, '</$1>')
  )
}
