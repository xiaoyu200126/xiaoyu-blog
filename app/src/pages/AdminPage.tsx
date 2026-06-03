import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'

const API = '/api'
const CATEGORIES = ['生活碎碎念', '实用主义研究', '关联主义学习', 'BRAND ALL IN AI']
const ALL_TAGS = ['AI', '随笔', '工具', '效率', '认知', '学习', '关系', '摄影', '城市', '开篇', '知识管理']

interface Article {
  id: string; title: string; date: string; category: string
  excerpt: string; content: string; image: string
  tags: string[]; readTime: string
}

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [images, setImages] = useState<{ filename: string; url: string }[]>([])
  const [tab, setTab] = useState<'list' | 'edit' | 'images'>('list')
  const [editing, setEditing] = useState<Article | null>(null)
  const [filter, setFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [msg, setMsg] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchArticles = () => fetch(`${API}/articles`).then(r => r.json()).then(setArticles)
  const fetchImages = () => fetch(`${API}/images`).then(r => r.json()).then(setImages)

  useEffect(() => { fetchArticles(); fetchImages() }, [])

  const filtered = articles.filter(a => {
    if (catFilter && a.category !== catFilter) return false
    if (filter && !a.title.includes(filter) && !a.id.includes(filter)) return false
    return true
  })

  const startNew = () => {
    setEditing({
      id: '', title: '', date: new Date().toISOString().slice(0, 10), category: '生活碎碎念',
      excerpt: '', content: '', image: '', tags: [], readTime: ''
    })
    setPreview(false); setTab('edit')
  }
  const startEdit = async (id: string) => {
    const r = await fetch(`${API}/articles/${id}`)
    const a = await r.json(); setEditing(a); setPreview(false); setTab('edit')
  }

  const saveArticle = async () => {
    if (!editing || !editing.id || !editing.title) return setMsg('请填写ID和标题')
    setSaving(true)
    await fetch(`${API}/articles/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing)
    })
    setSaving(false); setMsg('已保存'); fetchArticles()
    setTimeout(() => setMsg(''), 2000)
  }

  const deleteArticle = async (id: string) => {
    if (!confirm(`确定删除「${id}」？`)) return
    await fetch(`${API}/articles/${id}`, { method: 'DELETE' })
    fetchArticles(); setMsg('已删除')
  }

  const uploadImage = async () => {
    const f = fileRef.current?.files?.[0]; if (!f) return
    const fd = new FormData(); fd.append('image', f)
    await fetch(`${API}/upload`, { method: 'POST', body: fd })
    fetchImages(); setMsg('上传成功'); if (fileRef.current) fileRef.current.value = ''
  }

  const deleteImage = async (filename: string) => {
    if (!confirm(`删除 ${filename}？`)) return
    await fetch(`${API}/images/${filename}`, { method: 'DELETE' })
    fetchImages()
  }

  const gitSync = async () => {
    setSyncing(true)
    try {
      const r = await fetch(`${API}/sync`, { method: 'POST' })
      const d = await r.json()
      setMsg(d.message || d.error || '同步完成')
    } catch (e: any) { setMsg(e.message) }
    setSyncing(false)
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', fontFamily: 'var(--font-sans)' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 24px', borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-secondary)', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text)', textDecoration: 'none', fontFamily: 'var(--font-display)' }}>
            ← XIAOYU
          </Link>
          <button onClick={() => { setTab('list'); setEditing(null) }}
            style={btnStyle(tab === 'list')}>文章列表</button>
          <button onClick={startNew}
            style={btnStyle(tab === 'edit')}>+ 新建</button>
          <button onClick={() => setTab('images')}
            style={btnStyle(tab === 'images')}>图片管理</button>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {msg && <span style={{ fontSize: '13px', color: 'var(--color-accent)' }}>{msg}</span>}
          <button onClick={gitSync} disabled={syncing}
            style={{ ...btnStyle(false), backgroundColor: 'var(--color-accent)', color: '#fff' }}>
            {syncing ? '推送中...' : '同步到仓库'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 52px)' }}>
        {/* Sidebar */}
        <div style={{
          width: '220px', borderRight: '1px solid var(--color-border)',
          padding: '20px 16px', backgroundColor: 'var(--color-bg)', flexShrink: 0, overflowY: 'auto'
        }}>
          <h3 style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            栏目
          </h3>
          <button onClick={() => setCatFilter('')}
            style={sideBtnStyle(!catFilter)}>全部文章</button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              style={sideBtnStyle(catFilter === c)}>{c}</button>
          ))}

          <h3 style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: '24px 0 12px' }}>
            标签
          </h3>
          {ALL_TAGS.map(t => (
            <button key={t} onClick={() => setFilter(t === filter ? '' : t)}
              style={sideBtnStyle(filter === t)}>{t}</button>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* ARTICLE LIST */}
          {tab === 'list' && (
            <div>
              <input
                placeholder="搜索文章标题或ID..."
                value={filter} onChange={e => setFilter(e.target.value)}
                style={{
                  width: '100%', padding: '10px 16px', fontSize: '14px',
                  border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)', marginBottom: '16px', borderRadius: '4px', outline: 'none'
                }}
              />
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={thStyle}>标题</th><th style={thStyle}>日期</th><th style={thStyle}>栏目</th><th style={thStyle}>标签</th><th style={thStyle}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{a.title}</span>
                        <br /><span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{a.id}</span>
                      </td>
                      <td style={tdStyle}>{a.date}</td>
                      <td style={tdStyle}><span style={badgeStyle}>{a.category}</span></td>
                      <td style={tdStyle}>{a.tags?.slice(0, 3).map(t => <span key={t} style={{ ...badgeStyle, marginRight: '4px', fontSize: '10px' }}>{t}</span>)}</td>
                      <td style={tdStyle}>
                        <button onClick={() => startEdit(a.id)} style={actionBtn}>编辑</button>
                        <button onClick={() => deleteArticle(a.id)} style={{ ...actionBtn, color: '#c0392b' }}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>暂无文章</p>}
            </div>
          )}

          {/* EDITOR */}
          {tab === 'edit' && editing && (
            <div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <button onClick={() => { setTab('list'); setEditing(null) }} style={btnStyle(false)}>← 返回列表</button>
                <button onClick={saveArticle} disabled={saving}
                  style={{ ...btnStyle(false), backgroundColor: 'var(--color-accent)', color: '#fff' }}>
                  {saving ? '保存中...' : '保存文章'}
                </button>
                <button onClick={() => setPreview(!preview)} style={btnStyle(preview)}>
                  {preview ? '编辑' : '预览'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr' : '400px 1fr', gap: '24px' }}>
                {/* Form */}
                {!preview && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Field label="ID (英文)" value={editing.id} onChange={v => setEditing({ ...editing, id: v })} />
                    <Field label="标题" value={editing.title} onChange={v => setEditing({ ...editing, title: v })} />
                    <Field label="日期" value={editing.date} onChange={v => setEditing({ ...editing, date: v })} type="date" />
                    <div>
                      <label style={lblStyle}>栏目</label>
                      <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
                        style={inputStyle}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lblStyle}>封面图</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })}
                          style={{ ...inputStyle, flex: 1 }} placeholder="/images/xxx.jpg" />
                        {editing.image && <img src={editing.image} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} alt="" />}
                      </div>
                    </div>
                    <div>
                      <label style={lblStyle}>标签（逗号分隔）</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                        {ALL_TAGS.map(t => (
                          <button key={t} onClick={() => {
                            const tags = editing.tags || []
                            setEditing({ ...editing, tags: tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t] })
                          }}
                          style={{
                            padding: '2px 8px', fontSize: '11px', borderRadius: '3px', border: '1px solid var(--color-border)',
                            cursor: 'pointer',
                            backgroundColor: editing.tags?.includes(t) ? 'var(--color-accent)' : 'transparent',
                            color: editing.tags?.includes(t) ? '#fff' : 'var(--color-text-muted)',
                          }}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <Field label="摘要" value={editing.excerpt} onChange={v => setEditing({ ...editing, excerpt: v })} />
                    <Field label="阅读时长" value={editing.readTime} onChange={v => setEditing({ ...editing, readTime: v })} placeholder="如 8 min read" />
                  </div>
                )}

                {/* Markdown Editor / Preview */}
                <div>
                  {!preview ? (
                    <textarea
                      value={editing.content}
                      onChange={e => setEditing({ ...editing, content: e.target.value })}
                      style={{
                        width: '100%', height: 'calc(100vh - 200px)', minHeight: '500px',
                        padding: '16px', fontSize: '14px', fontFamily: 'monospace', lineHeight: 1.7,
                        backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)',
                        border: '1px solid var(--color-border)', borderRadius: '4px', resize: 'vertical',
                        outline: 'none',
                      }}
                      placeholder="# 开始写文章..."
                    />
                  ) : (
                    <div className="article-content" style={{
                      padding: '24px', backgroundColor: 'var(--color-bg-secondary)',
                      borderRadius: '4px', minHeight: '500px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto'
                    }}>
                      <h1>{editing.title || '(无标题)'}</h1>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '24px' }}>
                        {editing.date} · {editing.category} · {editing.readTime}
                      </div>
                      {editing.content.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: '28px', margin: '24px 0 12px' }}>{line.slice(2)}</h1>
                        if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '22px', margin: '20px 0 10px' }}>{line.slice(3)}</h2>
                        if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '18px', margin: '16px 0 8px' }}>{line.slice(4)}</h3>
                        if (line.startsWith('> ')) return <blockquote key={i} style={{ borderLeft: '3px solid var(--color-accent-light)', padding: '8px 16px', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: '12px 0' }}>{line.slice(2)}</blockquote>
                        if (line.startsWith('- ')) return <li key={i} style={{ margin: '4px 0 4px 20px' }}>{line.slice(2)}</li>
                        if (line.startsWith('![')) { const m = line.match(/!\[.*\]\((.*)\)/); return m ? <img key={i} src={m[1]} style={{ maxWidth: '100%', margin: '12px 0', borderRadius: '4px' }} alt="" /> : <p key={i}>{line}</p> }
                        if (line === '') return <br key={i} />
                        if (line === '---') return <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
                        return <p key={i} style={{ margin: '4px 0', lineHeight: '1.8' }}>{line}</p>
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* IMAGES */}
          {tab === 'images' && (
            <div>
              <div style={{ marginBottom: '24px', padding: '20px', border: '2px dashed var(--color-border)', borderRadius: '8px', textAlign: 'center', backgroundColor: 'var(--color-bg-secondary)' }}>
                <p style={{ marginBottom: '12px', color: 'var(--color-text-muted)' }}>拖拽或点击上传图片</p>
                <input ref={fileRef} type="file" accept="image/*" onChange={uploadImage}
                  style={{ fontSize: '14px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {images.map(img => (
                  <div key={img.filename} style={{ border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--color-bg-secondary)' }}>
                    <img src={img.url} style={{ width: '100%', height: '140px', objectFit: 'cover' }} alt="" />
                    <div style={{ padding: '8px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', wordBreak: 'break-all', marginBottom: '4px' }}>{img.filename}</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => { navigator.clipboard.writeText(img.url); setMsg('已复制路径'); setTimeout(() => setMsg(''), 1500) }}
                          style={{ ...actionBtn, fontSize: '11px' }}>复制路径</button>
                        <button onClick={() => deleteImage(img.filename)}
                          style={{ ...actionBtn, fontSize: '11px', color: '#c0392b' }}>删除</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Helper components ---
function Field({ label, value, onChange, type, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label style={lblStyle}>{label}</label>
      <input type={type || 'text'} value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

const btnStyle = (active: boolean) => ({
  padding: '8px 18px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--color-border)',
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
  backgroundColor: active ? 'var(--color-border)' : 'transparent',
  color: 'var(--color-text)',
})

const sideBtnStyle = (active: boolean) => ({
  display: 'block', width: '100%', textAlign: 'left' as const,
  padding: '6px 10px', fontSize: '13px', border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-sans)', backgroundColor: 'transparent',
  color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
  fontWeight: active ? 600 : 400, borderRadius: '4px', marginBottom: '2px',
})

const lblStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px',
  color: 'var(--color-text-muted)', letterSpacing: '0.05em'
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', fontSize: '14px',
  border: '1px solid var(--color-border)', borderRadius: '4px',
  backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)', outline: 'none',
  boxSizing: 'border-box',
}
const thStyle: React.CSSProperties = {
  padding: '12px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em'
}
const tdStyle: React.CSSProperties = { padding: '12px 12px', fontSize: '13px', color: 'var(--color-text)' }
const badgeStyle: React.CSSProperties = {
  display: 'inline-block', padding: '2px 8px', fontSize: '11px',
  border: '1px solid var(--color-border)', borderRadius: '3px',
  color: 'var(--color-text-muted)', whiteSpace: 'nowrap',
}
const actionBtn: React.CSSProperties = {
  padding: '4px 10px', fontSize: '12px', border: 'none', cursor: 'pointer',
  backgroundColor: 'transparent', color: 'var(--color-accent)',
  fontFamily: 'var(--font-sans)',
}
