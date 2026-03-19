'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { PILLARS, PILLAR_COLORS, type Pillar, type Topic } from '../../lib/data'
import { InterviewInsights } from './InterviewInsights'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveAt: string
}

interface AppData {
  done: string[]
  notes: Record<string, string>
  streak: StreakData
}

const TAG_LABELS: Record<string, string> = { hot: '🔥 frequently asked', mnc: 'MNC must-know', hard: 'tricky' }
const TAG_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  hot:  { color: '#f97316', bg: 'rgba(249,115,22,0.07)',  border: 'rgba(249,115,22,0.3)' },
  mnc:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.3)' },
  hard: { color: '#f472b6', bg: 'rgba(244,114,182,0.07)', border: 'rgba(244,114,182,0.3)' },
}

const ghostBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600,
  color: 'var(--muted)', background: 'var(--bg3)', border: '1px solid var(--border)',
  padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
}

// ─── localStorage helpers — key passed as param so user.id stays in scope ─────
function readCache(key: string): Partial<AppData> {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : {} } catch { return {} }
}
function writeCache(key: string, data: AppData) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function Roadmap({ user }: { user: User }) {
  // Per-user localStorage key — prevents data leaking between accounts
  const lsKey = `roadmap_cache_v1_${user.id}`

  const [done, setDone] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastActiveAt: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [view, setView] = useState<'roadmap' | 'stats' | 'insights'>('roadmap')
  const [noteDrawer, setNoteDrawer] = useState<{ topicKey: string; topicName: string; pillarTitle: string } | null>(null)

  useEffect(() => {
    // 1. Show localStorage data instantly (fixes blank state on slow connections)
    const cache = readCache(lsKey)
    if (cache.done) setDone(new Set(cache.done))
    if (cache.notes) setNotes(cache.notes)
    if (cache.streak) setStreak(cache.streak)

    // 2. Sync from DB in background
    fetch('/api/progress')
      .then(r => r.ok ? r.json() : null)
      .then((data: AppData | null) => {
        if (!data) return
        setDone(new Set(data.done))
        setNotes(data.notes || {})
        setStreak(data.streak || { currentStreak: 0, longestStreak: 0, lastActiveAt: '' })
        writeCache(lsKey, data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [lsKey])

  const toggleTopic = useCallback(async (key: string) => {
    const newDone = !done.has(key)
    const nextDone = new Set(done)
    newDone ? nextDone.add(key) : nextDone.delete(key)
    setDone(nextDone)

    // Update streak optimistically
    let nextStreak = streak
    if (newDone) {
      const now = new Date()
      const last = streak.lastActiveAt ? new Date(streak.lastActiveAt) : null
      const isNewDay = !last || last.toDateString() !== now.toDateString()
      const cur = isNewDay ? streak.currentStreak + 1 : streak.currentStreak
      nextStreak = { currentStreak: cur, longestStreak: Math.max(cur, streak.longestStreak), lastActiveAt: now.toISOString() }
      setStreak(nextStreak)
    }

    // Write to localStorage immediately so progress survives page refresh
    writeCache(lsKey, { done: Array.from(nextDone), notes, streak: nextStreak })

    setSaving(key)
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicKey: key, done: newDone }),
      })
    } catch {
      // revert on network failure
      setDone(prev => { const n = new Set(prev); newDone ? n.delete(key) : n.add(key); return n })
    } finally { setSaving(null) }
  }, [done, notes, streak, lsKey])

  const saveNote = useCallback(async (topicKey: string, content: string) => {
    const nextNotes = { ...notes, [topicKey]: content }
    if (!content.trim()) delete nextNotes[topicKey]
    setNotes(nextNotes)
    setNoteDrawer(null)
    writeCache(lsKey, { done: Array.from(done), notes: nextNotes, streak })
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicKey, content }),
      })
    } catch {}
  }, [notes, done, streak, lsKey])

  const resetAll = useCallback(async () => {
    if (!confirm('Reset all progress and notes? This cannot be undone.')) return
    setDone(new Set())
    setStreak({ currentStreak: 0, longestStreak: 0, lastActiveAt: '' })
    writeCache(lsKey, { done: [], notes: {}, streak: { currentStreak: 0, longestStreak: 0, lastActiveAt: '' } })
    await fetch('/api/progress', { method: 'DELETE' })
  }, [lsKey])

  const total = PILLARS.reduce((s, p) => s + p.sections.reduce((ss, sec) => ss + sec.topics.length, 0), 0)
  const pct = total ? Math.round(done.size / total * 100) : 0
  const visiblePillars = activeFilter === 'all' ? PILLARS : PILLARS.filter(p => p.id === activeFilter)

  return (
    <div style={{ paddingBottom: '72px' }}>
      {/* STICKY HEADER */}
      <header className="rm-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user.image && <Image src={user.image} alt={user.name || ''} width={32} height={32} style={{ borderRadius: '50%', border: '1.5px solid var(--border-hi)' }} />}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>{user.name}</p>
            <p className="rm-user-email">{user.email}</p>
          </div>
        </div>
        <div className="rm-header-right">
          {streak.currentStreak > 0 && (
            <span style={{ padding: '4px 10px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '99px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#f97316', fontWeight: 600 }}>
              🔥 {streak.currentStreak}d streak
            </span>
          )}
          {streak.longestStreak > 1 && (
            <span className="rm-streak-long" style={{ padding: '4px 10px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '99px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#a78bfa' }}>
              🏆 best {streak.longestStreak}d
            </span>
          )}
          {([['roadmap','Roadmap'],['stats','Stats'],['insights','🔍 Insights']] as const).map(([v, label]) => (
            <button key={v} onClick={() => setView(v as 'roadmap' | 'stats' | 'insights')} style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', background: view === v ? 'rgba(167,139,250,0.15)' : 'var(--bg3)', color: view === v ? '#a78bfa' : 'var(--muted)', border: view === v ? '1px solid rgba(167,139,250,0.35)' : '1px solid var(--border)' }}>
              {label}
            </button>
          ))}
          <button onClick={resetAll} style={ghostBtnStyle} className="rm-btn-reset">Reset</button>
          <button onClick={() => signOut()} style={ghostBtnStyle}>Sign out</button>
        </div>
      </header>

      {/* HERO */}
      <div style={{ padding: '36px var(--px) 24px', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: '360px', height: '360px', background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>// Senior Java Engineer · MNC Interview Roadmap</p>
        <h1 style={{ fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          Master the <span style={{ color: '#a78bfa' }}>fundamentals.</span> Clear the bar.
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>170+ topics · 8 pillars · synced to your account</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 600 }}>
            {loading ? '–' : done.size} <span style={{ fontSize: '13px', color: 'var(--muted)' }}>/ {total} done</span>
          </span>
          <div style={{ flex: 1, minWidth: '140px', height: '6px', background: 'var(--bg3)', borderRadius: '99px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#a78bfa,#34d399)', borderRadius: '99px', transition: 'width 0.6s cubic-bezier(.4,0,.2,1)' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)', minWidth: '36px' }}>{pct}%</span>
        </div>
      </div>

      {view === 'stats' ? (
        <StatsView done={done} total={total} streak={streak} notes={notes} />
      ) : view === 'insights' ? (
        <div style={{ padding: '24px var(--px)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
              🔍 Interview <span style={{ color: '#a78bfa' }}>Insights</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
              Paste real interview experiences from LinkedIn, Glassdoor, or anywhere. AI extracts every question, maps it to your roadmap, and shows what topics are missing from your prep.
            </p>
          </div>
          <InterviewInsights />
        </div>
      ) : (
        <>
          {/* FILTER */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '12px var(--px)', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
            <FilterChip label="All pillars" color="#e8eaf0" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
            {PILLARS.map(p => (
              <FilterChip key={p.id} label={`${p.icon} ${p.title.split(' ').slice(0,2).join(' ')}`} color={PILLAR_COLORS[p.color].text} active={activeFilter === p.id} onClick={() => setActiveFilter(p.id)} />
            ))}
          </div>
          {/* GRID */}
          <div className="rm-grid" style={{ background: 'var(--border)' }}>
            {visiblePillars.map(p => (
              <PillarCard key={p.id} pillar={p} done={done} saving={saving} notes={notes}
                onToggle={toggleTopic}
                onNote={(key, name) => setNoteDrawer({ topicKey: key, topicName: name, pillarTitle: p.title })} />
            ))}
          </div>
        </>
      )}

      {/* FOOTER */}
      <div className="rm-footer" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(12,14,20,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border)', padding: '10px var(--px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
          Click to check off · ✏️ hover to add notes · ✨ AI notes · <span style={{ color: 'var(--text)' }}>saved to your account</span>
        </p>
        {saving && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#a78bfa' }}>saving…</p>}
      </div>

      {noteDrawer && (
        <NoteDrawer
          topicKey={noteDrawer.topicKey}
          topicName={noteDrawer.topicName}
          pillarTitle={noteDrawer.pillarTitle}
          initialContent={notes[noteDrawer.topicKey] || ''}
          onSave={saveNote}
          onClose={() => setNoteDrawer(null)}
        />
      )}
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatsView({ done, total, streak, notes }: { done: Set<string>; total: number; streak: StreakData; notes: Record<string, string> }) {
  const pct = total ? Math.round(done.size / total * 100) : 0
  const noteCount = Object.values(notes).filter(n => n.trim()).length
  const remaining = PILLARS.flatMap(p => p.sections.flatMap(sec => sec.topics.filter(t => t.tags.includes('hot') && !done.has(`${p.id}::${t.name}`)).map(t => ({ pillar: p, topic: t })))).slice(0, 12)

  return (
    <div style={{ padding: '24px var(--px)' }}>
      <div className="rm-stats-grid">
        {[
          { label: 'Topics done', value: done.size, sub: `of ${total}`, color: '#a78bfa' },
          { label: 'Completion', value: `${pct}%`, sub: 'overall', color: '#34d399' },
          { label: 'Current streak', value: streak.currentStreak, sub: 'days', color: '#f97316', emoji: '🔥' },
          { label: 'Longest streak', value: streak.longestStreak, sub: 'days', color: '#facc15', emoji: '🏆' },
          { label: 'Notes written', value: noteCount, sub: 'annotations', color: '#38bdf8', emoji: '📝' },
        ].map(s => (
          <div key={s.label} style={{ padding: '18px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '8px' }}>{s.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 800, color: s.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.emoji && <span style={{ marginRight: '4px', fontSize: '20px' }}>{s.emoji}</span>}{s.value}</p>
            <p style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '3px' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '12px' }}>Progress by pillar</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
        {PILLARS.map(p => {
          const pt = p.sections.reduce((s, sec) => s + sec.topics.length, 0)
          const pd = p.sections.reduce((s, sec) => s + sec.topics.filter(t => done.has(`${p.id}::${t.name}`)).length, 0)
          const pp = pt ? Math.round(pd / pt * 100) : 0
          const c = PILLAR_COLORS[p.color]
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'var(--bg2)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>{p.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: c.text }}>{p.title}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{pd}/{pt}</span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg3)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pp}%`, background: c.text, borderRadius: '99px', transition: 'width 0.6s' }} />
                </div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: c.text, minWidth: '34px', textAlign: 'right' }}>{pp}%</span>
            </div>
          )
        })}
      </div>

      {remaining.length > 0 && (
        <>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '12px' }}>🔥 Frequently asked — still pending</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {remaining.map(({ pillar, topic }) => {
              const c = PILLAR_COLORS[pillar.color]
              return (
                <div key={`${pillar.id}::${topic.name}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <span>{pillar.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{topic.name}</span>
                  <span style={{ fontSize: '11px', color: c.text, fontFamily: 'var(--font-mono)' }}>{pillar.title.split(' ')[0]}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Pillar Card ──────────────────────────────────────────────────────────────

function PillarCard({ pillar, done, saving, notes, onToggle, onNote }: {
  pillar: Pillar; done: Set<string>; saving: string | null
  notes: Record<string, string>
  onToggle: (key: string) => void
  onNote: (key: string, name: string) => void
}) {
  const c = PILLAR_COLORS[pillar.color]
  const total = pillar.sections.reduce((s, sec) => s + sec.topics.length, 0)
  const doneCount = pillar.sections.reduce((s, sec) => s + sec.topics.filter(t => done.has(`${pillar.id}::${t.name}`)).length, 0)
  const pct = total ? Math.round(doneCount / total * 100) : 0

  return (
    <div style={{ background: 'var(--bg)', padding: '26px 22px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, background: c.bg, border: `1px solid ${c.border}` }}>{pillar.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: c.text, lineHeight: 1.2, marginBottom: '1px' }}>{pillar.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{total} topics</div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', textAlign: 'right' }}>
          <span style={{ fontSize: '17px', fontWeight: 600, color: c.text }}>{doneCount}</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>/{total}</span>
        </div>
      </div>
      <div style={{ height: '3px', background: 'var(--bg3)', borderRadius: '99px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: c.text, borderRadius: '99px', transition: 'width 0.5s' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {pillar.sections.map(sec => (
          <div key={sec.label}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', padding: '11px 8px 5px' }}>{sec.label}</p>
            {sec.topics.map(topic => (
              <TopicRow key={topic.name} topic={topic} topicKey={`${pillar.id}::${topic.name}`} pillarColor={c.text}
                isDone={done.has(`${pillar.id}::${topic.name}`)} isSaving={saving === `${pillar.id}::${topic.name}`}
                hasNote={!!notes[`${pillar.id}::${topic.name}`]?.trim()} onToggle={onToggle} onNote={onNote} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Topic Row ────────────────────────────────────────────────────────────────

function TopicRow({ topic, topicKey, pillarColor, isDone, isSaving, hasNote, onToggle, onNote }: {
  topic: Topic; topicKey: string; pillarColor: string
  isDone: boolean; isSaving: boolean; hasNote: boolean
  onToggle: (k: string) => void; onNote: (k: string, n: string) => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '7px 8px', borderRadius: '7px', border: `1px solid ${hover ? 'var(--border)' : 'transparent'}`, background: hover ? 'var(--bg3)' : 'transparent', opacity: isSaving ? 0.6 : isDone ? 0.42 : 1, color: isDone ? pillarColor : 'inherit', transition: 'background 0.1s' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div onClick={() => onToggle(topicKey)} style={{ width: '15px', height: '15px', borderRadius: '4px', flexShrink: 0, marginTop: '3px', cursor: 'pointer', border: isDone ? `1.5px solid ${pillarColor}` : '1.5px solid var(--dim)', background: isDone ? pillarColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
        {isDone && <svg width="8" height="8" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#0c0e14" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onToggle(topicKey)}>
        <p style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.35, textDecoration: isDone ? 'line-through' : 'none' }}>{topic.name}</p>
        {topic.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '3px' }}>
            {topic.tags.map(tag => { const tc = TAG_COLORS[tag]; return <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '1px 6px', borderRadius: '3px', color: tc.color, background: tc.bg, border: `1px solid ${tc.border}` }}>{TAG_LABELS[tag]}</span> })}
          </div>
        )}
      </div>
      <button onClick={() => onNote(topicKey, topic.name)} title={hasNote ? 'Edit note' : 'Add note'}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px', fontSize: '12px', opacity: hasNote ? 1 : hover ? 0.55 : 0, transition: 'opacity 0.15s', color: hasNote ? '#38bdf8' : 'var(--muted)', flexShrink: 0, marginTop: '1px' }}>
        {hasNote ? '📝' : '✏️'}
      </button>
    </div>
  )
}

// ─── Note Drawer with AI Notes ────────────────────────────────────────────────

function NoteDrawer({ topicKey, topicName, pillarTitle, initialContent, onSave, onClose }: {
  topicKey: string
  topicName: string
  pillarTitle: string
  initialContent: string
  onSave: (key: string, content: string) => void
  onClose: () => void
}) {
  const [content, setContent] = useState(initialContent)
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [aiError, setAiError] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { ref.current?.focus() }, [])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') onSave(topicKey, content)
  }

  const generateAiNotes = async () => {
    setAiState('loading')
    setAiError('')
    try {
      const res = await fetch('/api/ai-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicName, pillarTitle }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (!data.notes) throw new Error('Empty response from AI')
      setContent(prev =>
        prev.trim()
          ? `${prev}\n\n--- ✨ AI Generated ---\n${data.notes}`
          : data.notes
      )
      setAiState('idle')
      setTimeout(() => ref.current?.focus(), 100)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setAiError(msg)
      setAiState('error')
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50 }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(440px, 100vw)', maxWidth: '100vw', background: 'var(--bg2)', borderLeft: '1px solid var(--border)', zIndex: 51, display: 'flex', flexDirection: 'column', padding: 'clamp(16px, 5vw, 22px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', gap: '10px' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{pillarTitle}</p>
            <p style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.3 }}>{topicName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
        </div>

        {/* ✨ AI Generate button */}
        <button
          onClick={generateAiNotes}
          disabled={aiState === 'loading'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '10px 16px', marginBottom: '10px',
            background: aiState === 'loading' ? 'rgba(167,139,250,0.05)' : 'rgba(167,139,250,0.1)',
            border: '1px solid rgba(167,139,250,0.3)', borderRadius: '9px',
            color: '#a78bfa', fontSize: '13px', fontWeight: 600,
            fontFamily: 'var(--font-sans)', cursor: aiState === 'loading' ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s', width: '100%',
          }}
        >
          {aiState === 'loading' ? (
            <>
              <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(167,139,250,0.25)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'ai-spin 0.7s linear infinite', flexShrink: 0 }} />
              Generating study notes…
            </>
          ) : (
            <>✨ Generate AI study notes</>
          )}
        </button>
        <style>{`@keyframes ai-spin { to { transform: rotate(360deg) } }`}</style>

        {/* Error message */}
        {aiState === 'error' && (
          <div style={{ padding: '8px 12px', marginBottom: '10px', background: 'rgba(244,114,182,0.07)', border: '1px solid rgba(244,114,182,0.25)', borderRadius: '7px' }}>
            <p style={{ fontSize: '12px', color: '#f472b6', fontFamily: 'var(--font-mono)' }}>⚠ {aiError}</p>
            {(aiError.includes('ANTHROPIC_API_KEY') || aiError.includes('configured')) && (
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                Add ANTHROPIC_API_KEY to your .env and .env.local files
              </p>
            )}
            {aiError.includes('401') && (
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                Invalid API key — check ANTHROPIC_API_KEY in .env
              </p>
            )}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKey}
          placeholder={'Your study notes:\n• Key interview points\n• Common gotchas\n• Code snippets\n\nOr click ✨ above to generate AI notes!'}
          style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7, resize: 'none', outline: 'none' }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
          <p style={{ flex: 1, fontSize: '10px', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>⌘+Enter save · Esc close</p>
          {initialContent.trim() && (
            <button onClick={() => onSave(topicKey, '')} style={{ ...ghostBtnStyle, color: '#f472b6', borderColor: 'rgba(244,114,182,0.3)' }}>Delete</button>
          )}
          <button onClick={() => onSave(topicKey, content)} style={{ ...ghostBtnStyle, color: '#34d399', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)', fontWeight: 700 }}>
            Save note
          </button>
        </div>
      </div>
    </>
  )
}

function FilterChip({ label, color, active, onClick }: { label: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', color, opacity: active ? 1 : 0.4, background: active ? `${color}12` : 'transparent', border: active ? `1px solid ${color}35` : '1px solid transparent', whiteSpace: 'nowrap', transition: 'all 0.12s' }}>
      {label}
    </button>
  )
}
