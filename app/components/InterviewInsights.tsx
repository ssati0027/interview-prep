'use client'

import { useState } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Question {
  text: string
  type: string
  difficulty: 'easy' | 'medium' | 'hard'
  pillar: string
  covered_in_roadmap: boolean
  topic_match: string | null
  frequency: 'always' | 'often' | 'sometimes'
}

interface Round {
  round: string
  focus: string
  questions: Question[]
}

interface SearchResult {
  company: string
  role: string
  level: string
  interview_rounds: Round[]
  total_questions: number
  key_focus_areas: string[]
  difficulty_profile: { easy: number; medium: number; hard: number }
  gaps: string[]
  tips: string[]
  sources_used: string[]
}

interface PasteResult {
  company: string
  role: string
  level: string
  source: string
  questions: {
    text: string
    pillar: string
    difficulty: string
    covered: boolean
    topic_match: string | null
  }[]
  gaps: string[]
  key_themes: string[]
  rounds: string[]
  takeaways: string[]
}

type SavedEntry = {
  id: string
  type: 'search' | 'paste'
  data: SearchResult | PasteResult
  savedAt: string
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const PILLAR_COLORS: Record<string, string> = {
  'Java Internals': '#f97316', 'Design Patterns': '#a78bfa', 'Concurrency': '#34d399',
  'System Design': '#38bdf8', 'DS & Algorithms': '#f472b6', 'Spring Boot': '#facc15',
  'Databases': '#fb7185', 'Behavioral': '#67e8f9', 'Other': '#6b7280',
}

const DIFF_COLOR: Record<string, string> = { easy: '#34d399', medium: '#f97316', hard: '#f472b6' }
const FREQ_COLOR: Record<string, string> = { always: '#f472b6', often: '#f97316', sometimes: '#6b7280' }
const FREQ_LABEL: Record<string, string> = { always: '🔴 Always asked', often: '🟠 Often asked', sometimes: '⚪ Sometimes' }

const TOP_COMPANIES = [
  { name: 'Google', icon: '🔵' }, { name: 'Amazon', icon: '🟠' },
  { name: 'Microsoft', icon: '🟦' }, { name: 'Adobe', icon: '🔴' },
  { name: 'Walmart', icon: '🟡' }, { name: 'Flipkart', icon: '🟣' },
  { name: 'Uber', icon: '⚫' }, { name: 'Swiggy', icon: '🟠' },
  { name: 'PhonePe', icon: '🟣' }, { name: 'Razorpay', icon: '🔵' },
  { name: 'CRED', icon: '⚫' }, { name: 'Meesho', icon: '🟣' },
  { name: 'Atlassian', icon: '🔵' }, { name: 'Nutanix', icon: '🟢' },
  { name: 'Oracle', icon: '🔴' }, { name: 'SAP', icon: '🔵' },
]

const LEVELS = ['Junior (0-2yr)', 'Mid-Level (2-4yr)', 'Senior (4-7yr)', 'Staff/Principal (7yr+)']
const ROLES = ['Java Backend Engineer', 'Full Stack Engineer', 'Software Engineer', 'Senior SDE', 'SDE-2', 'SDE-3', 'Staff Engineer']

const ghostBtn: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600,
  color: 'var(--muted)', background: 'var(--bg3)', border: '1px solid var(--border)',
  padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function InterviewInsights() {
  const [activeTab, setActiveTab] = useState<'search' | 'paste' | 'history' | 'gaps'>('search')
  const [history, setHistory] = useState<SavedEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('interview_history_v2') || '[]') } catch { return [] }
  })

  const saveEntry = (entry: SavedEntry) => {
    const next = [entry, ...history].slice(0, 30)
    setHistory(next)
    try { localStorage.setItem('interview_history_v2', JSON.stringify(next)) } catch {}
  }

  const clearHistory = () => {
    setHistory([])
    try { localStorage.removeItem('interview_history_v2') } catch {}
  }

  // Aggregate gaps across all history
  const allGaps: string[] = history.flatMap(h =>
    h.type === 'search' ? (h.data as SearchResult).gaps || [] : (h.data as PasteResult).gaps || []
  )
  const gapCounts: Record<string, number> = {}
  allGaps.forEach(g => { gapCounts[g] = (gapCounts[g] || 0) + 1 })
  const sortedGaps = Object.entries(gapCounts).sort((a, b) => b[1] - a[1])

  // All questions across history for pillar frequency
  const allQuestions: { pillar: string }[] = history.reduce<{ pillar: string }[]>((acc, h) => {
    if (h.type === 'search') {
      const qs = (h.data as SearchResult).interview_rounds?.flatMap(r => r.questions) || []
      return [...acc, ...qs]
    }
    const qs = (h.data as PasteResult).questions || []
    return [...acc, ...qs]
  }, [])
  const pillarCounts: Record<string, number> = {}
  allQuestions.forEach(q => { pillarCounts[q.pillar] = (pillarCounts[q.pillar] || 0) + 1 })

  return (
    <div>
      {/* Tabs */}
      <div className="insight-tabs">
        {([
          ['search', '🔍 Search by Company', `Find all questions`],
          ['paste', '📋 Paste Experience', 'Analyze any post'],
          ['history', `📚 History (${history.length})`, 'Past searches'],
          ['gaps', '🚨 Gap Report', 'Missing topics'],
        ] as const).map(([tab, label, sub]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 16px', borderRadius: '8px', border: '1px solid',
            cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600,
            background: activeTab === tab ? 'rgba(167,139,250,0.15)' : 'var(--bg3)',
            color: activeTab === tab ? '#a78bfa' : 'var(--muted)',
            borderColor: activeTab === tab ? 'rgba(167,139,250,0.35)' : 'var(--border)',
            transition: 'all 0.15s',
          }}>
            {label}
            <span style={{ display: 'block', fontSize: '10px', fontWeight: 400, color: activeTab === tab ? '#a78bfaaa' : 'var(--dim)', fontFamily: 'var(--font-mono)' }}>{sub}</span>
          </button>
        ))}
      </div>

      {activeTab === 'search' && <SearchTab onSave={saveEntry} />}
      {activeTab === 'paste' && <PasteTab onSave={saveEntry} />}
      {activeTab === 'history' && <HistoryTab history={history} onClear={clearHistory} />}
      {activeTab === 'gaps' && <GapsTab sortedGaps={sortedGaps} pillarCounts={pillarCounts} historyCount={history.length} />}
    </div>
  )
}

// ─── Search Tab ────────────────────────────────────────────────────────────────

function SearchTab({ onSave }: { onSave: (e: SavedEntry) => void }) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('Java Backend Engineer')
  const [level, setLevel] = useState('Senior (4-7yr)')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState('')
  const [activeRound, setActiveRound] = useState(0)
  const [filterPillar, setFilterPillar] = useState('all')
  const [filterDiff, setFilterDiff] = useState('all')
  const [filterFreq, setFilterFreq] = useState('all')
  const [showOnlyGaps, setShowOnlyGaps] = useState(false)

  const search = async () => {
    if (!company.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const r = await fetch('/api/search-interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, level }),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || `HTTP ${r.status}`) }
      const data: SearchResult = await r.json()
      setResult(data)
      setActiveRound(0)
      onSave({ id: Date.now().toString(), type: 'search', data, savedAt: new Date().toISOString() })
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Unknown error') }
    finally { setLoading(false) }
  }

  // All questions across all rounds flat
  const allQ = result?.interview_rounds?.flatMap(r => r.questions) || []

  // Filtered questions for "All Questions" view
  const filteredQ = allQ.filter(q =>
    (filterPillar === 'all' || q.pillar === filterPillar) &&
    (filterDiff === 'all' || q.difficulty === filterDiff) &&
    (filterFreq === 'all' || q.frequency === filterFreq) &&
    (!showOnlyGaps || !q.covered_in_roadmap)
  )

  const pillarsInResult = result ? [...new Set(allQ.map(q => q.pillar))] : []
  const coveredCount = allQ.filter(q => q.covered_in_roadmap).length
  const coveragePct = allQ.length ? Math.round(coveredCount / allQ.length * 100) : 0

  return (
    <div>
      {/* Search form */}
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '14px', padding: 'clamp(14px, 4vw, 20px)', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.6 }}>
          Select a company and role — AI searches its training data, Glassdoor patterns, LeetCode discuss, LinkedIn posts, and GeeksForGeeks to compile <strong style={{ color: 'var(--text)' }}>every question</strong> asked at that company.
        </p>

        {/* Company quick picks */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {TOP_COMPANIES.map(c => (
            <button key={c.name} onClick={() => setCompany(c.name)} style={{
              padding: '5px 11px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              background: company === c.name ? 'rgba(167,139,250,0.15)' : 'var(--bg2)',
              color: company === c.name ? '#a78bfa' : 'var(--muted)',
              border: company === c.name ? '1px solid rgba(167,139,250,0.35)' : '1px solid var(--border)',
            }}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        <div className="insight-search-grid">
          <div>
            <p style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Company</p>
            <input
              value={company}
              onChange={e => setCompany(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="e.g. Google, Atlassian…"
              style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none' }}
            />
          </div>
          <div>
            <p style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role</p>
            <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none' }}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Level</p>
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none' }}>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={search} disabled={loading || !company.trim()} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px',
            background: loading ? 'rgba(167,139,250,0.05)' : 'rgba(167,139,250,0.15)',
            border: '1px solid rgba(167,139,250,0.3)', borderRadius: '9px',
            color: '#a78bfa', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-sans)',
            cursor: loading || !company.trim() ? 'not-allowed' : 'pointer',
            opacity: !company.trim() ? 0.5 : 1,
          }}>
            {loading
              ? <><Spinner /> Finding all questions…</>
              : <>🔍 Find All Interview Questions</>
            }
          </button>
          {result && <button onClick={() => { setResult(null); setCompany('') }} style={ghostBtn}>Clear</button>}
          {error && <p style={{ fontSize: '12px', color: '#f472b6', fontFamily: 'var(--font-mono)' }}>⚠ {error}</p>}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div>
          {/* Summary header */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <div style={{ flex: 1, minWidth: '200px', padding: '16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <p style={{ fontSize: '22px', fontWeight: 800 }}>{result.company}</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>{result.role} · {result.level}</p>
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                {result.sources_used?.map(s => (
                  <span key={s} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '99px', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', fontFamily: 'var(--font-mono)' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Stats */}
            {[
              { label: 'Questions found', value: result.total_questions, color: '#a78bfa' },
              { label: 'Rounds', value: result.interview_rounds?.length || 0, color: '#38bdf8' },
              { label: 'Roadmap coverage', value: `${coveragePct}%`, color: coveragePct >= 70 ? '#34d399' : coveragePct >= 40 ? '#f97316' : '#f472b6' },
              { label: 'Gaps found', value: result.gaps?.length || 0, color: '#f472b6' },
            ].map(s => (
              <div key={s.label} style={{ padding: '16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center', minWidth: '100px' }}>
                <p style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>{s.label}</p>
                <p style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Key focus areas */}
          {result.key_focus_areas?.length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>KEY FOCUS:</span>
              {result.key_focus_areas.map(a => (
                <span key={a} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa' }}>{a}</span>
              ))}
            </div>
          )}

          {/* Difficulty profile */}
          {result.difficulty_profile && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {Object.entries(result.difficulty_profile).map(([d, c]) => (
                <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '99px', background: `${DIFF_COLOR[d]}12`, border: `1px solid ${DIFF_COLOR[d]}30` }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: DIFF_COLOR[d], display: 'inline-block' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: DIFF_COLOR[d] }}>{c} {d}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div style={{ padding: '14px 16px', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '10px', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '7px', fontFamily: 'var(--font-mono)' }}>💡 {result.company.toUpperCase()} INTERVIEW TIPS</p>
              {result.tips.map((t, i) => (
                <p key={i} style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '3px', lineHeight: 1.5 }}>→ {t}</p>
              ))}
            </div>
          )}

          {/* Round tabs */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button onClick={() => setActiveRound(-1)} style={{ padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', background: activeRound === -1 ? 'rgba(167,139,250,0.15)' : 'var(--bg3)', color: activeRound === -1 ? '#a78bfa' : 'var(--muted)', border: activeRound === -1 ? '1px solid rgba(167,139,250,0.35)' : '1px solid var(--border)' }}>
              All ({allQ.length})
            </button>
            {result.interview_rounds?.map((r, i) => (
              <button key={i} onClick={() => setActiveRound(i)} style={{ padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', background: activeRound === i ? 'rgba(167,139,250,0.15)' : 'var(--bg3)', color: activeRound === i ? '#a78bfa' : 'var(--muted)', border: activeRound === i ? '1px solid rgba(167,139,250,0.35)' : '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                {r.round} ({r.questions?.length || 0})
              </button>
            ))}
          </div>

          {/* Filters for All view */}
          {activeRound === -1 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', padding: '10px 12px', background: 'var(--bg3)', borderRadius: '9px', border: '1px solid var(--border)', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>FILTER:</span>

              {/* Pillar filter */}
              <select value={filterPillar} onChange={e => setFilterPillar(e.target.value)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', outline: 'none' }}>
                <option value="all">All pillars</option>
                {pillarsInResult.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {/* Difficulty filter */}
              <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', outline: 'none' }}>
                <option value="all">All difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* Frequency filter */}
              <select value={filterFreq} onChange={e => setFilterFreq(e.target.value)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', outline: 'none' }}>
                <option value="all">All frequency</option>
                <option value="always">Always asked</option>
                <option value="often">Often asked</option>
                <option value="sometimes">Sometimes</option>
              </select>

              {/* Gaps toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px', color: showOnlyGaps ? '#f472b6' : 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                <input type="checkbox" checked={showOnlyGaps} onChange={e => setShowOnlyGaps(e.target.checked)} style={{ accentColor: '#f472b6' }} />
                Only gaps
              </label>

              {(filterPillar !== 'all' || filterDiff !== 'all' || filterFreq !== 'all' || showOnlyGaps) && (
                <button onClick={() => { setFilterPillar('all'); setFilterDiff('all'); setFilterFreq('all'); setShowOnlyGaps(false) }} style={{ ...ghostBtn, fontSize: '11px', padding: '3px 8px' }}>Reset</button>
              )}
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>{filteredQ.length} shown</span>
            </div>
          )}

          {/* Questions */}
          {activeRound === -1 ? (
            <QuestionList questions={filteredQ} />
          ) : (
            result.interview_rounds?.[activeRound] && (
              <div>
                <div style={{ padding: '10px 14px', background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '9px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>{result.interview_rounds[activeRound].round}</p>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{result.interview_rounds[activeRound].focus}</p>
                </div>
                <QuestionList questions={result.interview_rounds[activeRound].questions} />
              </div>
            )
          )}

          {/* Gaps */}
          {result.gaps?.length > 0 && (
            <div style={{ padding: '16px', background: 'rgba(244,114,182,0.05)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: '12px', marginTop: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#f472b6', marginBottom: '8px' }}>
                🚨 {result.gaps.length} topics NOT in standard roadmap — specific to {result.company}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {result.gaps.map(g => (
                  <span key={g} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.25)', color: '#f472b6' }}>{g}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Question List ─────────────────────────────────────────────────────────────

function QuestionList({ questions }: { questions: Question[] }) {
  if (!questions.length) return (
    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: '13px' }}>No questions match the filter.</div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {questions.map((q, i) => {
        const pc = PILLAR_COLORS[q.pillar] || '#6b7280'
        const dc = DIFF_COLOR[q.difficulty] || '#6b7280'
        const fc = FREQ_COLOR[q.frequency] || '#6b7280'
        return (
          <div key={i} style={{ display: 'flex', gap: '10px', padding: '11px 14px', background: 'var(--bg3)', borderRadius: '9px', border: `1px solid ${!q.covered_in_roadmap ? 'rgba(244,114,182,0.2)' : 'var(--border)'}`, alignItems: 'flex-start' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '2px', background: q.covered_in_roadmap ? '#34d399' : 'rgba(244,114,182,0.2)', border: q.covered_in_roadmap ? 'none' : '1px solid rgba(244,114,182,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: q.covered_in_roadmap ? '#0c0e14' : '#f472b6' }}>
              {q.covered_in_roadmap ? '✓' : '!'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4, marginBottom: '5px' }}>{q.text}</p>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '99px', color: pc, background: `${pc}14`, border: `1px solid ${pc}30` }}>{q.pillar}</span>
                <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '99px', color: dc, background: `${dc}14`, border: `1px solid ${dc}30` }}>{q.difficulty}</span>
                <span style={{ fontSize: '10px', color: fc, fontFamily: 'var(--font-mono)' }}>{FREQ_LABEL[q.frequency]}</span>
                {q.topic_match && <span style={{ fontSize: '10px', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>→ {q.topic_match}</span>}
                {!q.covered_in_roadmap && <span style={{ fontSize: '10px', color: '#f472b6', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>NOT IN ROADMAP</span>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Paste Tab ────────────────────────────────────────────────────────────────

function PasteTab({ onSave }: { onSave: (e: SavedEntry) => void }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PasteResult | null>(null)
  const [error, setError] = useState('')

  const analyze = async () => {
    if (!text.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const r = await fetch('/api/analyze-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || `HTTP ${r.status}`) }
      const data: PasteResult = await r.json()
      setResult(data)
      onSave({ id: Date.now().toString(), type: 'paste', data, savedAt: new Date().toISOString() })
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Unknown error') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.6 }}>
        Paste any interview experience — LinkedIn post, Glassdoor review, WhatsApp forward, YouTube comment, Telegram message. AI extracts every question asked.
      </p>
      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder={`Paste here…\n\n• "I interviewed at Amazon for SDE-2. Round 1 was DSA — they asked me to find the LCA of a binary tree…"\n• LinkedIn post with question lists\n• Glassdoor interview review\n• WhatsApp forwards with question dumps`}
        style={{ width: '100%', minHeight: '180px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7, resize: 'vertical', outline: 'none', marginBottom: '12px' }} />
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={analyze} disabled={loading || !text.trim()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: loading ? 'rgba(167,139,250,0.05)' : 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '9px', color: '#a78bfa', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-sans)', cursor: loading || !text.trim() ? 'not-allowed' : 'pointer', opacity: !text.trim() ? 0.5 : 1 }}>
          {loading ? <><Spinner /> Analyzing…</> : '✨ Extract All Questions'}
        </button>
        {text && <button onClick={() => { setText(''); setResult(null) }} style={ghostBtn}>Clear</button>}
        {error && <p style={{ fontSize: '12px', color: '#f472b6', fontFamily: 'var(--font-mono)' }}>⚠ {error}</p>}
      </div>

      {result && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 700 }}>{result.company}</span>
            <span style={{ fontSize: '12px', color: 'var(--muted)', background: 'var(--bg3)', padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border)' }}>{result.role}</span>
            <span style={{ fontSize: '12px', color: 'var(--muted)', background: 'var(--bg3)', padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border)' }}>{result.level}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, marginLeft: 'auto' }}>{result.questions?.length || 0} questions extracted</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px' }}>
            {result.questions?.map((q, i) => {
              const pc = PILLAR_COLORS[q.pillar] || '#6b7280'
              return (
                <div key={i} style={{ display: 'flex', gap: '10px', padding: '11px 14px', background: 'var(--bg3)', borderRadius: '9px', border: `1px solid ${!q.covered ? 'rgba(244,114,182,0.2)' : 'var(--border)'}`, alignItems: 'flex-start' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '2px', background: q.covered ? '#34d399' : 'rgba(244,114,182,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: q.covered ? '#0c0e14' : '#f472b6' }}>
                    {q.covered ? '✓' : '!'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4, marginBottom: '4px' }}>{q.text}</p>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '99px', color: pc, background: `${pc}14`, border: `1px solid ${pc}30` }}>{q.pillar}</span>
                      <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '99px', color: DIFF_COLOR[q.difficulty] || '#6b7280', background: `${DIFF_COLOR[q.difficulty] || '#6b7280'}14`, border: `1px solid ${DIFF_COLOR[q.difficulty] || '#6b7280'}30` }}>{q.difficulty}</span>
                      {q.topic_match && <span style={{ fontSize: '10px', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>→ {q.topic_match}</span>}
                      {!q.covered && <span style={{ fontSize: '10px', color: '#f472b6', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>NOT IN ROADMAP</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {result.gaps?.length > 0 && (
            <div style={{ padding: '14px', background: 'rgba(244,114,182,0.05)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: '10px', marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#f472b6', marginBottom: '7px' }}>🚨 Topics NOT in roadmap</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {result.gaps.map(g => <span key={g} style={{ fontSize: '11px', padding: '2px 9px', borderRadius: '99px', background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.25)', color: '#f472b6' }}>{g}</span>)}
              </div>
            </div>
          )}
          {result.takeaways?.length > 0 && (
            <div style={{ padding: '14px', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '7px' }}>💡 Takeaways</p>
              {result.takeaways.map((t, i) => <p key={i} style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '3px' }}>→ {t}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── History Tab ───────────────────────────────────────────────────────────────

function HistoryTab({ history, onClear }: { history: SavedEntry[]; onClear: () => void }) {
  if (!history.length) return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
      <p style={{ fontSize: '24px', marginBottom: '8px' }}>📭</p>
      <p>Search a company or paste an experience to build your history.</p>
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {history.map(h => {
        const data = h.data as SearchResult & PasteResult
        const qCount = h.type === 'search'
          ? (data as SearchResult).total_questions || 0
          : (data as PasteResult).questions?.length || 0
        return (
          <div key={h.id} style={{ display: 'flex', gap: '12px', padding: '14px 16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '16px' }}>{h.type === 'search' ? '🔍' : '📋'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '3px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>{data.company || 'Unknown'}</span>
                <span style={{ fontSize: '11px', color: 'var(--muted)', background: 'var(--bg2)', padding: '1px 7px', borderRadius: '99px', border: '1px solid var(--border)' }}>{data.role}</span>
                <span style={{ fontSize: '11px', color: 'var(--muted)', background: 'var(--bg2)', padding: '1px 7px', borderRadius: '99px', border: '1px solid var(--border)' }}>{data.level}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
                {qCount} questions · {new Date(h.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        )
      })}
      <button onClick={onClear} style={{ ...ghostBtn, color: '#f472b6', borderColor: 'rgba(244,114,182,0.3)', alignSelf: 'flex-start', marginTop: '8px' }}>Clear history</button>
    </div>
  )
}

// ─── Gaps Tab ──────────────────────────────────────────────────────────────────

function GapsTab({ sortedGaps, pillarCounts, historyCount }: { sortedGaps: [string, number][]; pillarCounts: Record<string, number>; historyCount: number }) {
  if (!sortedGaps.length) return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
      <p style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</p>
      <p>Search or analyze more interviews to build your gap report.</p>
    </div>
  )
  const maxGap = sortedGaps[0]?.[1] || 1
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.6 }}>
        Topics appearing in real interviews but <strong style={{ color: '#f472b6' }}>not covered</strong> by your current roadmap. Based on <strong style={{ color: 'var(--text)' }}>{historyCount}</strong> searches/analyses.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '28px' }}>
        {sortedGaps.map(([gap, count]) => (
          <div key={gap} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>🚨</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>{gap}</p>
              <p style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '1px' }}>found in {count} interview{count > 1 ? 's' : ''}</p>
            </div>
            <div style={{ width: '80px', height: '4px', background: 'var(--bg2)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(count / maxGap) * 100}%`, background: count >= 3 ? '#f472b6' : count >= 2 ? '#f97316' : '#6b7280', borderRadius: '99px' }} />
            </div>
          </div>
        ))}
      </div>

      {Object.keys(pillarCounts).length > 0 && (
        <>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '12px' }}>Most tested pillars in real interviews</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(pillarCounts).sort((a, b) => b[1] - a[1]).map(([p, c]) => {
              const max = Math.max(...Object.values(pillarCounts))
              const color = PILLAR_COLORS[p] || '#6b7280'
              return (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '130px', fontSize: '12px', fontWeight: 600, color, flexShrink: 0 }}>{p}</div>
                  <div style={{ flex: 1, height: '5px', background: 'var(--bg3)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(c / max) * 100}%`, background: color, borderRadius: '99px', transition: 'width 0.6s' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', minWidth: '20px' }}>{c}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <>
      <style>{`@keyframes ai-spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(167,139,250,0.25)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'ai-spin 0.7s linear infinite', flexShrink: 0 }} />
    </>
  )
}