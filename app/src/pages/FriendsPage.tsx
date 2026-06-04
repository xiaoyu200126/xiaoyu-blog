import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import friendsData from '../../content/friends.json'

interface Friend {
  id: number
  name: string
  title: string
  description: string
  url?: string
  avatar?: string
}

const friends: Friend[] = friendsData

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
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, marginBottom: '4px', color: 'var(--color-text)' }}>
                {friend.url ? <a href={friend.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{friend.name}</a> : friend.name}
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
