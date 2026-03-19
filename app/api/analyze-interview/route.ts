import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../../../lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await req.json() as { content: string }
  if (!content?.trim()) return NextResponse.json({ error: 'No content provided' }, { status: 400 })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })

  const prompt = `You are an expert Java interview analyst. Analyze this interview experience/post and extract structured data.

INPUT:
${content.slice(0, 4000)}

Extract and return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "company": "company name or Unknown",
  "role": "role title or Unknown",
  "level": "junior/mid/senior/staff or Unknown",
  "source": "linkedin/glassdoor/post/unknown",
  "questions": [
    {
      "text": "the actual question asked",
      "pillar": "one of: Java Internals, Design Patterns, Concurrency, System Design, DS & Algorithms, Spring Boot, Databases, Behavioral, Other",
      "difficulty": "easy/medium/hard",
      "covered": true/false,
      "topic_match": "closest matching topic from the roadmap or null"
    }
  ],
  "gaps": ["topic1 not in roadmap", "topic2 not in roadmap"],
  "key_themes": ["theme1", "theme2", "theme3"],
  "rounds": ["Round 1: DSA", "Round 2: System Design"],
  "takeaways": ["key insight 1", "key insight 2"]
}

Rules:
- Extract EVERY question or topic asked, even implicitly mentioned ones
- For "covered": true means it maps to something already in a typical Java senior roadmap
- For "gaps": list specific topics that appear important but are NOT typically covered (e.g. "MarkLogic", "Document versioning", "Adobe-specific architecture")
- Be specific with question text — use exact wording if given, infer from context if not
- Maximum 20 questions
- Return ONLY the JSON object`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      max_tokens: 2000,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Groq error:', err)
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 })
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content ?? ''

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json(parsed)
  } catch {
    console.error('JSON parse error, raw:', text)
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }
}
