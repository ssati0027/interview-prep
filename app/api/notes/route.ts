import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

// POST /api/notes — save or delete a note for a topic
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const { topicKey, content } = await req.json() as { topicKey: string; content: string }
  if (!topicKey) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  if (!content.trim()) {
    // Empty note = delete
    await prisma.note.deleteMany({ where: { userId, topicKey } })
    return NextResponse.json({ ok: true, deleted: true })
  }

  const note = await prisma.note.upsert({
    where: { userId_topicKey: { userId, topicKey } },
    update: { content },
    create: { userId, topicKey, content },
  })

  return NextResponse.json(note)
}
