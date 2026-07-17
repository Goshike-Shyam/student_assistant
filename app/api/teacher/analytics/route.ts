import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'

export async function GET() {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const teacherId = BigInt(session.teacherId)

    const [classes, assignments, submissions] = await Promise.all([
      prisma.teacherClass.findMany({
        where: { teacherId },
        include: { _count: { select: { enrollments: true } } },
      }),
      prisma.teacherAssignment.findMany({
        where: { teacherId },
        select: {
          id: true,
          subject: true,
          topic: true,
          classId: true,
          dueDate: true,
          totalMarks: true,
          createdAt: true,
        },
      }),
      prisma.teacherAssignmentSubmission.findMany({
        where: {
          assignment: { teacherId },
        },
        select: {
          teacherAssignmentId: true,
          childId: true,
          status: true,
          score: true,
          submittedAt: true,
          assignment: { select: { subject: true, topic: true, totalMarks: true, classId: true } },
          child: { select: { id: true, name: true, parentEmail: true, email: true, grade: true } },
        },
      }),
    ])

    const totalStudents = classes.reduce((s, c) => s + c._count.enrollments, 0)
    const totalClasses = classes.length
    const totalAssignments = assignments.length

    const releasedWithScore = submissions.filter(
      (s) => s.status === 'RELEASED' && s.score !== null,
    )
    const avgClassScore =
      releasedWithScore.length > 0
        ? releasedWithScore.reduce((s, r) => s + Number(r.score), 0) / releasedWithScore.length
        : 0

    const totalSubs = submissions.length
    const submittedSubs = submissions.filter((s) =>
      ['SUBMITTED', 'REVIEWED', 'RELEASED'].includes(s.status),
    ).length
    const submissionRate = totalSubs > 0 ? (submittedSubs / totalSubs) * 100 : 0

    const pendingReviews = submissions.filter((s) => s.status === 'SUBMITTED').length

    // Assignment completion
    const assignmentMap = new Map<
      string,
      { topic: string; total: number; submitted: number; scores: number[] }
    >()
    for (const a of assignments) {
      assignmentMap.set(a.id.toString(), {
        topic: a.topic.slice(0, 30),
        total: 0,
        submitted: 0,
        scores: [],
      })
    }
    for (const sub of submissions) {
      const key = sub.teacherAssignmentId.toString()
      const entry = assignmentMap.get(key)
      if (!entry) continue
      entry.total++
      if (['SUBMITTED', 'REVIEWED', 'RELEASED'].includes(sub.status)) {
        entry.submitted++
        if (sub.score !== null && sub.assignment.totalMarks > 0) {
          entry.scores.push((Number(sub.score) / sub.assignment.totalMarks) * 100)
        }
      }
    }

    const assignmentCompletion = Array.from(assignmentMap.values())
      .filter((a) => a.total > 0)
      .map((a) => ({
        assignmentTopic: a.topic,
        submitted: a.submitted,
        total: a.total,
        avgScore: a.scores.length > 0 ? a.scores.reduce((s, v) => s + v, 0) / a.scores.length : 0,
      }))

    // Subject performance
    const subjectMap = new Map<string, { scores: number[]; attempts: number }>()
    for (const sub of releasedWithScore) {
      const subj = sub.assignment.subject
      if (!subjectMap.has(subj)) subjectMap.set(subj, { scores: [], attempts: 0 })
      const entry = subjectMap.get(subj)!
      if (sub.assignment.totalMarks > 0) {
        entry.scores.push((Number(sub.score) / sub.assignment.totalMarks) * 100)
      }
      entry.attempts++
    }
    const subjectPerformance = Array.from(subjectMap.entries()).map(([subject, d]) => ({
      subject,
      avgScore: d.scores.length > 0 ? d.scores.reduce((s, v) => s + v, 0) / d.scores.length : 0,
      attempts: d.attempts,
    }))

    // Student leaderboard
    const studentMap = new Map<
      string,
      { name: string; scores: number[]; submitted: number; grade: number | null }
    >()
    for (const sub of releasedWithScore) {
      const id = sub.child.id
      if (!studentMap.has(id)) {
        studentMap.set(id, { name: sub.child.name, scores: [], submitted: 0, grade: sub.child.grade })
      }
      const entry = studentMap.get(id)!
      if (sub.assignment.totalMarks > 0) {
        entry.scores.push((Number(sub.score) / sub.assignment.totalMarks) * 100)
      }
      entry.submitted++
    }
    const studentLeaderboard = Array.from(studentMap.values())
      .map((s) => ({
        childName: s.name,
        avgScore: s.scores.length > 0 ? s.scores.reduce((a, v) => a + v, 0) / s.scores.length : 0,
        submittedCount: s.submitted,
        grade: s.grade,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10)

    // Score distribution
    const ranges = [
      { range: '0-40', min: 0, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 },
    ]
    const scoreDistribution = ranges.map(({ range, min, max }) => ({
      range,
      count: releasedWithScore.filter((s) => {
        if (!s.assignment.totalMarks) return false
        const pct = (Number(s.score) / s.assignment.totalMarks) * 100
        return pct >= min && pct <= max
      }).length,
    }))

    // Weekly submissions (last 8 weeks)
    const weeklyMap = new Map<string, { submitted: number; total: number }>()
    const now = new Date()
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - w * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)
      const label = weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      const weekSubs = submissions.filter(
        (s) => s.submittedAt && s.submittedAt >= weekStart && s.submittedAt < weekEnd,
      )
      weeklyMap.set(label, { submitted: weekSubs.length, total: submissions.length })
    }
    const weeklySubmissions = Array.from(weeklyMap.entries()).map(([week, v]) => ({
      week,
      submitted: v.submitted,
      total: v.total,
    }))

    // At risk students
    const notStartedMap = new Map<
      string,
      { name: string; parentEmail: string; count: number; lastActivity: Date | null }
    >()
    for (const sub of submissions) {
      if (sub.status !== 'NOT_STARTED' && sub.status !== 'IN_PROGRESS') continue
      const id = sub.child.id
      if (!notStartedMap.has(id)) {
        notStartedMap.set(id, {
          name: sub.child.name,
          parentEmail: sub.child.parentEmail ?? sub.child.email ?? '',
          count: 0,
          lastActivity: null,
        })
      }
      notStartedMap.get(id)!.count++
    }
    const atRiskStudents = Array.from(notStartedMap.values())
      .filter((s) => s.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map((s) => ({
        childName: s.name,
        parentEmail: s.parentEmail,
        notStartedCount: s.count,
        lastActivity: s.lastActivity,
      }))

    // Recent activity feed (submissions + enrollments, newest first)
    function timeAgo(date: Date | null): string {
      if (!date) return 'unknown'
      const diffMs = Date.now() - date.getTime()
      const diffMin = Math.floor(diffMs / 60_000)
      if (diffMin < 1)   return 'just now'
      if (diffMin < 60)  return `${diffMin} min ago`
      const diffHr = Math.floor(diffMin / 60)
      if (diffHr < 24)   return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`
      const diffDay = Math.floor(diffHr / 24)
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
    }

    const recentSubmissionsForActivity = submissions
      .filter((s) => s.submittedAt !== null)
      .sort((a, b) =>
        (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0),
      )
      .slice(0, 8)
      .map((s) => ({
        type:      'SUBMISSION' as const,
        childName: s.child.name,
        detail:    `Submitted: ${s.assignment.topic} (${s.assignment.subject})`,
        timeAgo:   timeAgo(s.submittedAt),
        timestamp: s.submittedAt?.toISOString() ?? '',
      }))

    const recentEnrollmentsForActivity = await prisma.classEnrollment.findMany({
      where: { class: { teacherId } },
      include: {
        child: { select: { name: true } },
        class: { select: { className: true } },
      },
      orderBy: { enrolledAt: 'desc' },
      take: 5,
    })

    const enrollmentActivity = recentEnrollmentsForActivity.map((e) => ({
      type:      'ENROLLMENT' as const,
      childName: e.child.name,
      detail:    `Enrolled in ${e.class.className}`,
      timeAgo:   timeAgo(e.enrolledAt),
      timestamp: e.enrolledAt.toISOString(),
    }))

    const recentActivity = [...recentSubmissionsForActivity, ...enrollmentActivity]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({
      overview: {
        totalStudents,
        totalClasses,
        totalAssignments,
        avgClassScore: Math.round(avgClassScore * 10) / 10,
        submissionRate: Math.round(submissionRate * 10) / 10,
        pendingReviews,
      },
      assignmentCompletion,
      subjectPerformance,
      studentLeaderboard,
      scoreDistribution,
      weeklySubmissions,
      atRiskStudents,
      recentActivity,
    })
  } catch (err: any) {
    console.error('[teacher/analytics GET]', err)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
