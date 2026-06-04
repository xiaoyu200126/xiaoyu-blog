import { useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import aboutRaw from '../../content/about.md?raw'

function md2html(md: string): string {
  if (!md) return ''
  const lines = md.split('\n')
  let h = ''
  let inCode = false
  let codeBuf = ''
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const t = line.trim()
    if (t.startsWith('```')) {
      if (inCode) { h += `<pre><code>${esc(codeBuf)}</code></pre>`; codeBuf = ''; inCode = false }
      else inCode = true
      continue
    }
    if (inCode) { codeBuf += line + '\n'; continue }
    if (t.startsWith('#### ')) h += `<h4>${esc(t.slice(5))}</h4>`
    else if (t.startsWith('### ')) h += `<h3>${esc(t.slice(4))}</h3>`
    else if (t.startsWith('## ')) h += `<h2>${esc(t.slice(3))}</h2>`
    else if (t.startsWith('# ')) h += `<h1>${esc(t.slice(2))}</h1>`
    else if (t.startsWith('> ')) h += `<blockquote>${t.slice(2)}</blockquote>`
    else if (t === '---' || t === '***') h += '<hr>'
    else if (t === '') h += '<br>'
    else h += `<p>${t}</p>`
  }
  if (inCode && codeBuf) h += `<pre><code>${esc(codeBuf)}</code></pre>`
  return h
}
function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

export default function AboutPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const aboutHtml = useMemo(() => md2html(aboutRaw), [])

  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    gsap.fromTo(content, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 })
  }, [])

  return (
    <div style={{ minHeight: '100vh', paddingTop: '140px', paddingBottom: '80px', backgroundColor: 'var(--color-bg)' }}>
      <div ref={contentRef} style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
        <span className="badge-month" style={{ display: 'block', marginBottom: '24px' }}>
          About XIAOYU
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 300, lineHeight: 1.3, marginBottom: '48px', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          XIAOYU的随笔
        </h1>
        <div className="article-content" dangerouslySetInnerHTML={{ __html: aboutHtml }} />
      </div>
    </div>
  )
}
