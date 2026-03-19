import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../../../lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topicName, pillarTitle } = await req.json() as { topicName: string; pillarTitle: string }
  if (!topicName) return NextResponse.json({ error: 'Missing topicName' }, { status: 400 })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })

  const prompt = `You are a senior Java interview coach helping prepare for MNC interviews at Google, Amazon, and Walmart.

Generate concise study notes for this topic:
Topic: "${topicName}"
Pillar: "${pillarTitle}"

Use this structure (plain text, no markdown headers):
1. CORE CONCEPT (2-3 sentences)
2. WHY INTERVIEWERS ASK THIS (1-2 sentences)
3. KEY POINTS (4-6 bullets starting with •)
4. COMMON GOTCHA (1-2 sentences — what candidates miss)
5. QUICK CODE (optional small Java snippet if relevant)
6. INTERVIEW TIP (1 sentence)

Write for a developer with 4+ years experience. with clearsections and understanding and return only the notes without any additional commentary or formatting. Make sure to cover the most important aspects of the topic that are likely to be tested in interviews. Focus on clarity and conciseness.  Here is an example of the expected output format:
CORE CONCEPT: The Java Memory Model defines how threads interact through memory and what behaviors are allowed in concurrent programming.

WHY INTERVIEWERS ASK THIS: Understanding the memory model is crucial for writing correct concurrent code and avoiding subtle bugs.

KEY POINTS:
• The Java Memory Model specifies rules for visibility and ordering of variable accesses across threads.
• It defines happens-before relationships that determine when changes made by one thread become visible to others.
• Volatile variables ensure visibility of changes across threads without locking.
• Synchronized blocks create happens-before relationships, ensuring mutual exclusion and visibility.
• The model allows for certain reordering of instructions for performance, which can lead to unexpected behaviors if not properly understood.

COMMON GOTCHA: Many developers assume that changes made by one thread will immediately be visible to others, which is not guaranteed without proper synchronization.

QUICK CODE: public class Example {
    private volatile boolean flag = false;
    private int value = 0;

    public void setFlag() {
        flag = true;
    }

    public void setValue(int newValue) {
        value = newValue;
    }
}`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Groq API error:', err)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content ?? ''
  return NextResponse.json({ notes: text })
}