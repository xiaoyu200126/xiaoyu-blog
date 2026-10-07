import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '../lib/motion'
import type { Article } from '../data/articles'

interface PostListProps {
  posts: Article[]
  /** 是否在日期后显示分类名 */
  showCategory?: boolean
}

/**
 * 栏目页共用的文章列表。
 *
 * 三个栏目页（生活碎碎念 / BRAND & AI / 思考随笔）原本各写一份完全相同的
 * 列表与空态，样式调整要改三处，漏一处就出现栏目之间视觉不一致。
 * 动效参数照搬原实现（进入时一次性 stagger 淡入，不做滚动触发）。
 */
export default function PostList({ posts, showCategory = false }: PostListProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const items = itemRefs.current.filter(Boolean)
    if (items.length === 0) return
    gsap.fromTo(
      items,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.5 }
    )
  }, [posts.length])

  if (posts.length === 0) {
    return (
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px 0' }}>
        暂无文章，敬请期待...
      </p>
    )
  }

  return (
    <div>
      {posts.map((post, i) => (
        <div
          key={post.id}
          ref={(el) => { if (el) itemRefs.current[i] = el }}
          style={{ borderBottom: '1px solid var(--color-border)', padding: '32px 0' }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 400, color: 'var(--color-text-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: '12px' }}>
            {post.date}
            {showCategory && ` · ${post.category}`}
          </span>
          <h2 style={{ fontFamily: 'var(--font-display-mixed)', fontSize: 'clamp(18px, 2vw, 24px)', fontWeight: 600, lineHeight: 1.4, marginBottom: '12px', color: 'var(--color-text)', transition: 'color 0.3s ease' }}>
            <Link
              to={`/article/${post.id}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'inherit' }}
            >
              {post.title}
            </Link>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 400, lineHeight: 1.8, color: 'var(--color-text-secondary)' }}>
            {post.excerpt}
          </p>
        </div>
      ))}
    </div>
  )
}