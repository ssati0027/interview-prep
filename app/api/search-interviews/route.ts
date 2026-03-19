import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../../../lib/auth'

const GROQ_KEY = process.env.GROQ_API_KEY
const SERPER_KEY = process.env.SERPER_API_KEY // optional but better results

// Search using SerpAPI/Serper or fallback to Groq web search simulation
async function searchWeb(query: string): Promise<string[]> {
  if (SERPER_KEY) {
    const r = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 10 }),
    })
    const d = await r.json()
    return [
      ...(d.organic || []).map((x: {title:string; snippet:string; link:string}) => `SOURCE: ${x.link}\nTITLE: ${x.title}\nSNIPPET: ${x.snippet}`),
      ...(d.answerBox ? [`ANSWER BOX: ${d.answerBox.answer || d.answerBox.snippet || ''}`] : []),
    ]
  }
  // Fallback: return empty, let Groq use its training data
  return []
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!GROQ_KEY) return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })

  const { company, role, level } = await req.json() as {
    company: string
    role: string
    level: string
  }

  if (!company) return NextResponse.json({ error: 'Company is required' }, { status: 400 })

  const roleStr = role || 'Java Backend Engineer'
  const levelStr = level || 'Senior'

  // Build multiple search queries to maximize coverage
  const queries = [
    `${company} ${roleStr} interview questions Java 2024 2025`,
    `${company} ${levelStr} software engineer interview experience Java Spring Boot`,
    `${company} Java developer interview questions system design DSA`,
    `site:glassdoor.com ${company} Java interview questions`,
    `site:leetcode.com discuss ${company} interview experience Java`,
  ]

  // Fetch search results in parallel
  const searchResults: string[] = []
  if (SERPER_KEY) {
    const results = await Promise.allSettled(queries.map(q => searchWeb(q)))
    results.forEach(r => { if (r.status === 'fulfilled') searchResults.push(...r.value) })
  }

  const context = searchResults.length > 0
    ? `\n\nWEB SEARCH RESULTS:\n${searchResults.slice(0, 20).join('\n\n').slice(0, 6000)}`
    : ''

  const prompt = `You are an expert Java interview analyst with deep knowledge of tech company interview processes.

Company: ${company}
Role: ${roleStr}
Level: ${levelStr}${context}

Your task: Generate a COMPREHENSIVE list of ALL questions typically asked in ${company} interviews for ${levelStr} ${roleStr} positions.

Use your knowledge of:
- ${company}'s known interview patterns and culture
- Standard MNC interview rounds for this level  
- Common Java backend interview topics
- Real questions shared on Glassdoor, LinkedIn, LeetCode discuss, GeeksForGeeks
${context ? '- The web search results provided above' : ''}

Return ONLY valid JSON (no markdown) in this exact format:
{
  "company": "${company}",
  "role": "${roleStr}",
  "level": "${levelStr}",
  "interview_rounds": [
    {
      "round": "Round 1: DSA",
      "focus": "brief focus description",
      "questions": [
        {
          "text": "exact question text",
          "type": "dsa/java/spring/system-design/behavioral/concurrency/database",
          "difficulty": "easy/medium/hard",
          "pillar": "one of: Java Internals, Design Patterns, Concurrency, System Design, DS & Algorithms, Spring Boot, Databases, Behavioral, Other",
          "covered_in_roadmap": true/false,
          "topic_match": "closest roadmap topic or null",
          "frequency": "always/often/sometimes"
        }
      ]
    }
  ],
  "total_questions": 0,
  "key_focus_areas": ["area1", "area2"],
  "difficulty_profile": {"easy": 0, "medium": 0, "hard": 0},
  "gaps": ["topic not in standard roadmap"],
  "tips": ["specific tip for this company", "another tip"],
  "sources_used": ["glassdoor", "linkedin", "leetcode discuss", "knowledge base"]
}

Rules:
- Include MINIMUM 25-40 questions across all rounds
- Be SPECIFIC — not "explain OOP" but "Explain the difference between Abstract class and Interface with Java 8+ changes"
- Cover ALL rounds typically done at ${company} for this level
- Mark "covered_in_roadmap": true only if it maps to standard Java/Spring/DSA interview prep
- For gaps: list specific ${company}-specific things not in standard prep (e.g. their tech stack, culture questions)
- frequency: "always" = asked in almost every interview, "often" = common, "sometimes" = occasionally
- Return ONLY the JSON`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Groq error:', err)
    return NextResponse.json({ error: 'AI search failed' }, { status: 500 })
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content ?? ''

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    // Find the JSON object
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}') + 1
    const jsonStr = clean.slice(start, end)
    const parsed = JSON.parse(jsonStr)
    // Add total count
    parsed.total_questions = parsed.interview_rounds?.reduce(
      (s: number, r: {questions: unknown[]}) => s + (r.questions?.length || 0), 0
    ) || 0
    return NextResponse.json(parsed)
  } catch (e) {
    console.error('Parse error, raw:', text.slice(0, 500))
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }
}
