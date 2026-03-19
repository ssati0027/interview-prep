import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

// GET /api/progress — returns { done: string[], notes: Record<string, string>, streak }
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const [progressRows, noteRows, streak] = await Promise.all([
    prisma.progress.findMany({ where: { userId, done: true }, select: { topicKey: true } }),
    prisma.note.findMany({ where: { userId }, select: { topicKey: true, content: true } }),
    prisma.streak.findUnique({ where: { userId } }),
  ])

  return NextResponse.json({
    done: progressRows.map(r => r.topicKey),
    notes: Object.fromEntries(noteRows.map(r => [r.topicKey, r.content])),
    streak: streak ?? { currentStreak: 0, longestStreak: 0, lastActiveAt: new Date() },
  })
}

// POST /api/progress — toggle a topic + update streak
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const { topicKey, done } = await req.json() as { topicKey: string; done: boolean }
  if (!topicKey || typeof done !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Upsert progress
  await prisma.progress.upsert({
    where: { userId_topicKey: { userId, topicKey } },
    update: { done, doneAt: done ? new Date() : null },
    create: { userId, topicKey, done, doneAt: done ? new Date() : null },
  })

  // Update streak if marking done
  if (done) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const existing = await prisma.streak.findUnique({ where: { userId } })

    if (!existing) {
      await prisma.streak.create({ data: { userId, currentStreak: 1, longestStreak: 1, lastActiveAt: now } })
    } else {
      const last = new Date(existing.lastActiveAt)
      const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate())
      const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / 86400000)

      let newCurrent = existing.currentStreak
      if (diffDays === 0) {
        // Same day — no change
      } else if (diffDays === 1) {
        newCurrent += 1 // Consecutive day
      } else {
        newCurrent = 1  // Streak broken
      }

      await prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: newCurrent,
          longestStreak: Math.max(newCurrent, existing.longestStreak),
          lastActiveAt: now,
        },
      })
    }
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/progress — reset all
export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  await Promise.all([
    prisma.progress.deleteMany({ where: { userId } }),
    prisma.streak.deleteMany({ where: { userId } }),
  ])

  return NextResponse.json({ ok: true })
}
