import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const API = '/api'
const CATEGORIES = ['生活碎碎念', '实用主义研究', '关联主义学习', 'BRAND ALL IN AI']

interface Article {
  id: string; title: string; date: string; category: string
  excerpt: string; content: string; image: string
  tags: string[]; readTime: string
}

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [images, setImages] = useState<{ filename: string; url: string }[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [tab, setTab] = useState<'list' | 'edit' | 'images'>('list')
  const [editing, setEditing] = useState<Article | null>(null)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [msg, setMsg] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch(`${API}/articles`); setArticles(await r.json()) } catch {}
    setLoading(false)
  }, [])
  const fetchImages = useCallback(async () => {
    try { const r = await fetch(`${API}/images`); setImages(await r.json()) } catch {}
  }, [])
  const fetchTags = useCallback(async () => {
    try { const r = await fetch(`${API}/tags`); setAllTags(await r.json()) } catch {}
  }, [])

  useEffect(() => { fetchArticles(); fetchImages(); fetchTags() }, [fetchArticles, fetchImages, fetchTags])

  const filtered = articles.filter(a => {
    if (catFilter && a.category !== catFilter) return false
    if (tagFilter && !a.tags.includes(tagFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      if (!a.title.toLowerCase().includes(q) && !a.id.toLowerCase().includes(q) && !a.excerpt.toLowerCase().includes(q))
        return false
    }
    return true
  })

  const startNew = () => {
    if (dirty && !confirm('当前编辑未保存，确定放弃？')) return
    setEditing({
      id: '', title: '', date: new Date().toISOString().slice(0, 10), category: catFilter || '生活碎碎念',
      excerpt: '', content: '', image: '', tags: tagFilter ? [tagFilter] : [], readTime: ''
    })
    setPreview(false); setDirty(false); setTab('edit')
  }
  const startEdit = async (id: string) => {
    if (dirty && !confirm('当前编辑未保存，确定放弃？')) return
    setLoading(true)
    const r = await fetch(`${API}/articles/${id}`)
    const a = await r.json()
    setEditing(a); setPreview(false); setDirty(false); setTab('edit')
    setLoading(false)
  }

  const saveArticle = async () => {
    if (!editing || !editing.id || !editing.title) return setMsg('请填写 ID 和标题')
    if (editing.id !== editing.id.trim().toLowerCase().replace(/\s+/g, '-')) {
      if (!confirm('ID 建议使用英文小写+连字符，当前ID可能不规范，继续保存？')) return
    }
    setSaving(true)
    await fetch(`${API}/articles/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing)
    })
    setSaving(false); setDirty(false)
    setMsg('已保存'); fetchArticles(); fetchTags()
    setTimeout(() => setMsg(''), 2000)
  }

  const deleteArticle = async (id: string) => {
    if (!confirm(`确定删除「${id}」？此操作不可恢复。`)) return
    await fetch(`${API}/articles/${id}`, { method: 'DELETE' })
    fetchArticles(); fetchTags()
    if (editing?.id === id) { setEditing(null); setTab('list') }
    setMsg('已删除')
  }

  const uploadImage = async () => {
    const f = fileRef.current?.files?.[0]; if (!f) return
    const fd = new FormData(); fd.append('image', f)
    await fetch(`${API}/upload`, { method: 'POST', body: fd })
    fetchImages(); setMsg('上传成功')
    if (fileRef.current) fileRef.current.value = ''
  }

  const deleteImage = async (filename: string) => {
    if (!confirm(`删除 ${filename}？`)) return
    await fetch(`${API}/images/${filename}`, { method: 'DELETE' })
    fetchImages()
  }

  const update = (patch: Partial<Article>) => {
    if (editing) { setEditing({ ...editing, ...patch }); setDirty(true) }
  }

  const gitSync = async () => {
    setSyncing(true)
    try {
      const r = await fetch(`${API}/sync`, { method: 'POST' })
      const d = await r.json()
      setMsg(d.message || d.error || '同步完成')
    } catch (e: any) { setMsg(e.message) }
    setSyncing(false)
    setTimeout(() => setMsg(''), 4000)
  }

  const countByCat = (cat: string) => articles.filter(a => a.category === cat).length

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--font-sans)', backgroundColor: '#1a1a2e', color: '#e0e0e0' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 24px', backgroundColor: '#16213e', borderBottom: '1px solid #2a2a4a',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link to="/" style={{ fontWeight: 700, fontSize: '15px', color: '#e94560', textDecoration: 'none', fontFamily: 'var(--font-display)', marginRight: '20px' }}>
            ← 落笔阁
          </Link>
          <button onClick={() => { if (dirty && !confirm('未保存，确定离开？')) return; setTab('list'); setDirty(false) }}
            style={topBtn(tab === 'list')}>📋 文章</button>
          <button onClick={startNew}
            style={topBtn(false)}>＋ 新文章</button>
          <button onClick={() => setTab('images')}
            style={topBtn(tab === 'images')}>🖼 图片</button>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {dirty && <span style={{ fontSize: '12px', color: '#e94560' }}>● 未保存</span>}
          {msg && <span style={{ fontSize: '12px', color: '#46b5d1' }}>{msg}</span>}
          <button onClick={gitSync} disabled={syncing}
            style={{ ...topBtn(false), backgroundColor: '#e94560', color: '#fff', borderColor: '#e94560' }}>
            {syncing ? '⏳ 推送中...' : '🚀 同步到仓库'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 52px)' }}>
        {/* Sidebar */}
        <div style={{
          width: '200px', backgroundColor: '#16213e', borderRight: '1px solid #2a2a4a',
          padding: '16px 12px', flexShrink: 0, overflowY: 'auto',
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '10px' }}>
            栏目
          </div>
          {['全部', ...CATEGORIES].map(c => {
            const val = c === '全部' ? '' : c
            const count = c === '全部' ? articles.length : countByCat(c)
            return (
              <button key={c} onClick={() => { setCatFilter(val); setTagFilter('') }}
                style={sideBtn(catFilter === val)}>
                {c} <span style={{ fontSize: '10px', opacity: 0.6 }}>{count}</span>
              </button>
            )
          })}

          <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', margin: '18px 0 10px' }}>
            标签
          </div>
          {allTags.length === 0 && <div style={{ fontSize: '11px', color: '#666' }}>加载中...</div>}
          {allTags.map(t => (
            <button key={t} onClick={() => { setTagFilter(tagFilter === t ? '' : t); setCatFilter('') }}
              style={sideBtn(tagFilter === t)}>
              {t}
            </button>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#1a1a2e' }}>
          {/* ── LIST ── */}
          {tab === 'list' && (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  placeholder="搜索标题 / ID / 摘要..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={searchInput}
                />
                {(catFilter || tagFilter) && (
                  <button onClick={() => { setCatFilter(''); setTagFilter(''); }}
                    style={{ ...topBtn(false), fontSize: '12px', whiteSpace: 'nowrap' }}>
                    清除筛选
                  </button>
                )}
              </div>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>加载中...</p>
              ) : filtered.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>暂无匹配文章</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2a2a4a' }}>
                      <th style={th}>标题</th><th style={th}>日期</th><th style={th}>栏目</th><th style={th}>标签</th><th style={{ ...th, width: '120px' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #1f1f3a' }}>
                        <td style={td}>
                          <div style={{ fontWeight: 600 }}>{a.title || '(无标题)'}</div>
                          <div style={{ fontSize: '11px', color: '#666' }}>{a.id}</div>
                        </td>
                        <td style={td}>{a.date}</td>
                        <td style={td}><span style={badge}>{a.category}</span></td>
                        <td style={td}>
                          {a.tags?.slice(0, 4).map(t => (
                            <span key={t} style={{ ...badge, marginRight: '4px', fontSize: '10px', cursor: 'pointer' }}
                              onClick={() => setTagFilter(t)}>{t}</span>
                          ))}
                        </td>
                        <td style={td}>
                          <button onClick={() => startEdit(a.id)} style={actBtn}>编辑</button>
                          <button onClick={() => deleteArticle(a.id)} style={{ ...actBtn, color: '#e94560' }}>删除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── EDIT ── */}
          {tab === 'edit' && editing && (
            <div style={{ maxWidth: '1200px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                <button onClick={() => { setTab('list'); if (dirty && !confirm('未保存，确定离开？')) return; setDirty(false) }}
                  style={topBtn(false)}>← 返回</button>
                <button onClick={saveArticle} disabled={saving}
                  style={{ ...topBtn(false), backgroundColor: '#e94560', color: '#fff', borderColor: '#e94560' }}>
                  {saving ? '保存中...' : '💾 保存'}
                </button>
                <button onClick={() => setPreview(!preview)} style={topBtn(preview)}>
                  {preview ? '✏️ 编辑' : '👁 预览'}
                </button>
                <span style={{ fontSize: '11px', color: '#666' }}>
                  编辑: {editing.title || '新文章'} · ID: {editing.id || '(未设置)'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr' : '380px 1fr', gap: '20px', alignItems: 'start' }}>
                {!preview && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Field label="ID" value={editing.id} onChange={v => update({ id: v })}
                      placeholder="英文连字符，如 my-new-post" />
                    <Field label="标题" value={editing.title} onChange={v => update({ title: v })} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Field label="日期" value={editing.date} onChange={v => update({ date: v })} type="date" />
                      <Field label="阅读时长" value={editing.readTime} onChange={v => update({ readTime: v })} placeholder="如 8 min read" />
                    </div>
                    <div>
                      <label style={lbl}>栏目</label>
                      <select value={editing.category} onChange={e => update({ category: e.target.value })}
                        style={inp}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>封面图</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <input value={editing.image} onChange={e => update({ image: e.target.value })}
                            style={inp} placeholder="/images/xxx.jpg — 或从下方缩略图点选" />
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px', maxHeight: '80px', overflowY: 'auto' }}>
                            {images.slice(0, 12).map(img => (
                              <img key={img.filename} src={img.url}
                                onClick={() => update({ image: img.url })}
                                title={img.filename}
                                style={{
                                  width: '40px', height: '30px', objectFit: 'cover', borderRadius: '3px', cursor: 'pointer',
                                  border: editing.image === img.url ? '2px solid #e94560' : '1px solid #333',
                                  opacity: editing.image === img.url ? 1 : 0.6,
                                }} alt="" />
                            ))}
                          </div>
                        </div>
                        {editing.image && (
                          <img src={editing.image} style={{ width: '70px', height: '50px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                            alt="" />
                        )}
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>标签</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                        {allTags.map(t => {
                          const sel = editing.tags?.includes(t)
                          return (
                            <button key={t} onClick={() => {
                              const tags = editing.tags || []
                              update({ tags: sel ? tags.filter(x => x !== t) : [...tags, t] })
                            }}
                            style={{
                              padding: '2px 8px', fontSize: '11px', borderRadius: '3px', cursor: 'pointer',
                              border: sel ? '1px solid #e94560' : '1px solid #333',
                              backgroundColor: sel ? '#e94560' : 'transparent',
                              color: sel ? '#fff' : '#999',
                            }}>{t}</button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>摘要</label>
                      <textarea value={editing.excerpt} onChange={e => update({ excerpt: e.target.value })}
                        rows={3}
                        style={{ ...inp, resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: '13px' }}
                        placeholder="文章摘要，显示在首页卡片中..." />
                    </div>
                  </div>
                )}

                {/* Markdown Editor / Preview */}
                <div>
                  {!preview ? (
                    <textarea
                      value={editing.content}
                      onChange={e => update({ content: e.target.value })}
                      style={{
                        width: '100%', height: 'calc(100vh - 160px)', minHeight: '500px',
                        padding: '16px', fontSize: '14px', fontFamily: '"Fira Code", "Cascadia Code", monospace',
                        lineHeight: 1.8, backgroundColor: '#0f0f23', color: '#c9d1d9',
                        border: '1px solid #2a2a4a', borderRadius: '6px', resize: 'vertical', outline: 'none',
                      }}
                      placeholder="# 开始写文章..."
                    />
                  ) : (
                    <div style={{
                      padding: '24px 32px', backgroundColor: '#0f0f23', borderRadius: '6px',
                      border: '1px solid #2a2a4a', minHeight: '500px', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto',
                      color: '#c9d1d9',
                    }}>
                      <h1 style={{ color: '#e0e0e0', marginBottom: '8px' }}>{editing.title || '(无标题)'}</h1>
                      <div style={{ color: '#888', fontSize: '13px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #2a2a4a' }}>
                        {editing.date} · {editing.category} · {editing.readTime}
                      </div>
                      <div className="admin-preview">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {editing.content || '*正文为空*'}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── IMAGES ── */}
          {tab === 'images' && (
            <div>
              <div style={{
                marginBottom: '20px', padding: '24px', border: '2px dashed #2a2a4a', borderRadius: '8px',
                textAlign: 'center', backgroundColor: '#0f0f23',
              }}>
                <p style={{ color: '#888', marginBottom: '12px' }}>拖拽或点击上传图片，自动保存到 public/images/</p>
                <input ref={fileRef} type="file" accept="image/*" onChange={uploadImage}
                  style={{ fontSize: '14px', color: '#c9d1d9' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                {images.map(img => (
                  <div key={img.filename} style={{ backgroundColor: '#0f0f23', borderRadius: '6px', overflow: 'hidden', border: '1px solid #2a2a4a' }}>
                    <img src={img.url} style={{ width: '100%', height: '120px', objectFit: 'cover' }} alt="" />
                    <div style={{ padding: '6px 8px' }}>
                      <div style={{ fontSize: '10px', color: '#888', wordBreak: 'break-all', marginBottom: '4px' }}>{img.filename}</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => { navigator.clipboard.writeText(img.url); setMsg('路径已复制'); setTimeout(() => setMsg(''), 1500) }}
                          style={{ ...actBtn, fontSize: '10px' }}>复制</button>
                        <button onClick={() => deleteImage(img.filename)}
                          style={{ ...actBtn, fontSize: '10px', color: '#e94560' }}>删除</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-preview h1 { font-size: 28px; margin: 24px 0 12px; color: #e0e0e0; }
        .admin-preview h2 { font-size: 22px; margin: 20px 0 10px; color: #e0e0e0; }
        .admin-preview h3 { font-size: 18px; margin: 16px 0 8px; color: #e0e0e0; }
        .admin-preview p { margin: 8px 0; line-height: 1.8; font-size: 15px; }
        .admin-preview blockquote { border-left: 3px solid #e94560; padding: 8px 16px; margin: 12px 0; color: #999; font-style: italic; }
        .admin-preview ul, .admin-preview ol { padding-left: 24px; margin: 8px 0; }
        .admin-preview li { margin: 4px 0; }
        .admin-preview code { background: #1a1a2e; color: #e94560; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
        .admin-preview pre { background: #1a1a2e; padding: 16px; border-radius: 6px; overflow-x: auto; margin: 12px 0; }
        .admin-preview pre code { background: none; color: #c9d1d9; padding: 0; }
        .admin-preview img { max-width: 100%; border-radius: 4px; margin: 12px 0; }
        .admin-preview hr { border: none; border-top: 1px solid #2a2a4a; margin: 24px 0; }
        .admin-preview a { color: #46b5d1; }
        .admin-preview strong { color: #e0e0e0; }
        .admin-preview table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        .admin-preview th, .admin-preview td { border: 1px solid #2a2a4a; padding: 8px 12px; text-align: left; }
        .admin-preview th { background: #1a1a2e; }
      `}</style>
    </div>
  )
}

// ── helpers ──
function Field({ label, value, onChange, type, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input type={type || 'text'} value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inp} />
    </div>
  )
}

const topBtn = (active: boolean): React.CSSProperties => ({
  padding: '7px 16px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer',
  border: active ? '1px solid #e94560' : '1px solid #2a2a4a',
  backgroundColor: active ? '#2a1040' : 'transparent',
  color: active ? '#e94560' : '#999', fontFamily: 'var(--font-sans)',
})

const sideBtn = (active: boolean): React.CSSProperties => ({
  display: 'block', width: '100%', textAlign: 'left',
  padding: '5px 8px', fontSize: '12px', border: 'none', cursor: 'pointer',
  backgroundColor: active ? '#2a1040' : 'transparent',
  color: active ? '#e94560' : '#999', borderRadius: '3px', marginBottom: '1px',
  fontFamily: 'var(--font-sans)',
})

const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '3px', color: '#888', letterSpacing: '0.04em' }
const inp: React.CSSProperties = {
  width: '100%', padding: '8px 10px', fontSize: '13px',
  backgroundColor: '#0f0f23', color: '#c9d1d9', border: '1px solid #2a2a4a',
  borderRadius: '4px', outline: 'none', boxSizing: 'border-box',
}
const searchInput: React.CSSProperties = {
  flex: 1, padding: '8px 14px', fontSize: '13px',
  backgroundColor: '#0f0f23', color: '#c9d1d9', border: '1px solid #2a2a4a',
  borderRadius: '4px', outline: 'none',
}
const th: React.CSSProperties = { padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', textAlign: 'left' }
const td: React.CSSProperties = { padding: '10px 12px', fontSize: '13px', color: '#c9d1d9' }
const badge: React.CSSProperties = { display: 'inline-block', padding: '2px 7px', fontSize: '10px', border: '1px solid #2a2a4a', borderRadius: '3px', color: '#888' }
const actBtn: React.CSSProperties = { padding: '3px 8px', fontSize: '11px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#46b5d1' }
