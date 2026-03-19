'use client'

import { useSession, signIn } from 'next-auth/react'
import { Roadmap } from './components/Roadmap'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '14px', background: '#0c0e14' }}>
      <style>{`@keyframes _spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: '28px', height: '28px', border: '2px solid rgba(255,255,255,0.07)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: '_spin 0.8s linear infinite' }} />
      <p style={{ color: '#7a7e93', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>Loading…</p>
    </div>
  )

  if (session) return <Roadmap user={session.user} />
  return <LoginPage />
}

// ── Floating chip data ────────────────────────────────────────────────────────
const CHIPS = [
  { label: 'Singleton Pattern',    color: '#a78bfa' },
  { label: 'CompletableFuture',    color: '#34d399' },
  { label: 'CAP Theorem',          color: '#38bdf8' },
  { label: 'JVM Memory Model',     color: '#f97316' },
  { label: 'Dynamic Programming',  color: '#f472b6' },
  { label: 'Spring AOP',           color: '#facc15' },
  { label: 'ConcurrentHashMap',    color: '#34d399' },
  { label: 'SOLID Principles',     color: '#a78bfa' },
  { label: 'Kafka Partitions',     color: '#fb7185' },
  { label: 'Virtual Threads',      color: '#34d399' },
  { label: 'SQL Indexing',         color: '#fb7185' },
  { label: 'LRU Cache O(1)',       color: '#f472b6' },
  { label: 'Binary Search',        color: '#f472b6' },
  { label: 'CQRS Pattern',         color: '#a78bfa' },
  { label: 'Redis Eviction',       color: '#fb7185' },
  { label: 'ReentrantLock',        color: '#34d399' },
  { label: 'Graph BFS / DFS',      color: '#f472b6' },
  { label: 'Factory Pattern',      color: '#a78bfa' },
  { label: 'Spring Security',      color: '#facc15' },
  { label: 'Deadlock Prevention',  color: '#34d399' },
  { label: 'Consistent Hashing',   color: '#38bdf8' },
  { label: 'Clean Architecture',   color: '#a78bfa' },
  { label: 'ACID Properties',      color: '#fb7185' },
  { label: 'Event Sourcing',       color: '#a78bfa' },
  { label: 'Rate Limiting',        color: '#38bdf8' },
  { label: 'Bloom Filter',         color: '#38bdf8' },
  { label: 'Thread Pool Sizing',   color: '#34d399' },
  { label: 'HashMap Internals',    color: '#f97316' },
  { label: 'Trie / Prefix Tree',   color: '#f472b6' },
  { label: 'GC Algorithms',        color: '#f97316' },
  { label: 'Behavioral LP',        color: '#67e8f9' },
  { label: 'N+1 Problem',          color: '#facc15' },
  { label: 'Segment Tree',         color: '#f472b6' },
  { label: 'Circuit Breaker',      color: '#38bdf8' },
  { label: 'Hexagonal Arch',       color: '#a78bfa' },
  { label: 'Saga Pattern',         color: '#38bdf8' },
  { label: 'WebFlux / Reactor',    color: '#34d399' },
  { label: 'ThreadPoolExecutor',   color: '#34d399' },
  { label: '@Transactional',       color: '#facc15' },
  { label: 'Outbox Pattern',       color: '#a78bfa' },
]

const PILLARS = [
  { label: '☕ Java', color: '#f97316' },
  { label: '🏛 Patterns', color: '#a78bfa' },
  { label: '⚙ Concurrency', color: '#34d399' },
  { label: '🏗 System Design', color: '#38bdf8' },
  { label: '📊 DS & Algo', color: '#f472b6' },
  { label: '🌱 Spring', color: '#facc15' },
  { label: '🗄 Databases', color: '#fb7185' },
  { label: '🧠 Behavioral', color: '#67e8f9' },
]

function chipStyle(i: number): React.CSSProperties {
  const col  = i % 7
  const row  = Math.floor(i / 7)
  const left = (col / 7) * 88 + (i % 3) * 2.5
  const top  = (row / 6) * 88 + (i % 4) * 2
  const dur  = 16 + (i % 8) * 3
  const del  = -((i * 2.7) % dur)
  const rot  = ((i % 7) - 3) * 2
  return {
    left: `${left % 94}%`,
    top:  `${top  % 92}%`,
    animationDuration: `${dur}s`,
    animationDelay:    `${del}s`,
    '--rot': `${rot}deg`,
  } as React.CSSProperties
}

// ── Login Page ────────────────────────────────────────────────────────────────
function LoginPage() {
  return (
    <div style={{
      background: '#0c0e14',
      color: '#e8eaf0',
      fontFamily: "'Syne', sans-serif",
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        @keyframes _floatUp {
          0%   { opacity: 0; transform: translateY(0)   rotate(var(--rot)); }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-96vh) rotate(var(--rot)); }
        }
        @keyframes _blink { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes _fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ._chip {
          position: absolute;
          padding: 4px 11px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 500;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
          pointer-events: none;
          animation: _floatUp linear infinite;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          color: #7a7e93;
        }
        ._dot { animation: _blink 2.2s ease infinite; }
        ._a1 { animation: _fadeUp 0.55s 0.05s ease both; }
        ._a2 { animation: _fadeUp 0.55s 0.15s ease both; }
        ._a3 { animation: _fadeUp 0.55s 0.25s ease both; }
        ._a4 { animation: _fadeUp 0.55s 0.35s ease both; }
        ._a5 { animation: _fadeUp 0.55s 0.45s ease both; }
        ._signin:hover {
          border-color: rgba(167,139,250,0.5) !important;
          background: rgba(167,139,250,0.06) !important;
          transform: translateY(-1px);
        }
        ._signin { transition: border-color 0.15s, background 0.15s, transform 0.15s; }

        @media (max-width: 480px) {
          ._pillars { gap: 5px !important; }
          ._pillar  { font-size: 10px !important; padding: 3px 8px !important; }
          ._card    { padding: 22px 18px !important; }
          ._h1      { font-size: clamp(22px, 7vw, 36px) !important; }
          ._feats   { gap: 8px !important; }
        }
      `}</style>

      {/* ── Floating chip layer ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {CHIPS.map((c, i) => (
          <div key={c.label} className="_chip" style={chipStyle(i)}>{c.label}</div>
        ))}
      </div>

      {/* ── Edge fades ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to bottom, #0c0e14 0%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to top, #0c0e14 0%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '15%', background: 'linear-gradient(to right, #0c0e14 0%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '15%', background: 'linear-gradient(to left, #0c0e14 0%, transparent 100%)' }} />
      </div>

      {/* ── Purple glow ── */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 1 }} />

      {/* ── Main content — centered, no scroll ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 4vw, 32px)', position: 'relative', zIndex: 10 }}>

        {/* Eyebrow */}
        <div className="_a1" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', padding: '5px 14px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: 'clamp(12px, 2.5vh, 20px)', fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="_dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', display: 'inline-block', flexShrink: 0 }} />
          Senior Java Engineer · MNC Interview Roadmap
        </div>

        {/* Headline */}
        <h1 className="_a2 _h1" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(26px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 'clamp(8px, 1.5vh, 14px)', maxWidth: '640px' }}>
          Master the{' '}
          <span style={{ color: '#a78bfa' }}>fundamentals.</span>
          <br />Clear the bar.
        </h1>

        {/* Subline */}
        <p className="_a2" style={{ color: '#7a7e93', fontSize: 'clamp(12px, 1.8vw, 14px)', lineHeight: 1.65, textAlign: 'center', marginBottom: 'clamp(12px, 2vh, 20px)', maxWidth: '480px', fontWeight: 400 }}>
          170+ topics · 8 pillars · AI study notes · streak tracking · synced across all your devices
        </p>

        {/* Pillar chips */}
        <div className="_a3 _pillars" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: 'clamp(12px, 2.5vh, 22px)', maxWidth: '520px' }}>
          {PILLARS.map(p => (
            <span key={p.label} className="_pillar" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, color: p.color, border: `1px solid ${p.color}28`, background: `${p.color}0e` }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
              {p.label}
            </span>
          ))}
        </div>

        {/* Feature row */}
        <div className="_a4 _feats" style={{ display: 'flex', gap: '10px', marginBottom: 'clamp(14px, 2.5vh, 24px)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            ['🔥', 'Daily streaks', '#f97316'],
            ['✨', 'AI study notes', '#a78bfa'],
            ['📊', 'Stats dashboard', '#34d399'],
            ['🔍', 'Interview insights', '#38bdf8'],
          ].map(([icon, label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px' }}>{icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: color as string, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Sign-in card */}
        <div className="_a5 _card" style={{ background: '#13161f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: 'clamp(20px, 3vw, 28px) clamp(20px, 4vw, 32px)', width: '100%', maxWidth: '400px', position: 'relative', overflow: 'hidden' }}>
          {/* Card glow */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.08), transparent 70%)', pointerEvents: 'none' }} />

          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#7a7e93', marginBottom: '14px', textAlign: 'center', letterSpacing: '0.05em' }}>
            Sign in to sync progress across all devices
          </p>

          <button
            className="_signin"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', padding: '13px 20px', background: '#1a1d28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '99px', color: '#e8eaf0', fontSize: '14px', fontWeight: 700, fontFamily: "'Syne', sans-serif", cursor: 'pointer' }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p style={{ fontSize: '10px', color: '#4a4e63', marginTop: '12px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.03em' }}>
            No credit card · No degree required
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}