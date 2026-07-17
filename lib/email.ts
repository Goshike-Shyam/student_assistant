/**
 * EMAIL UTILITY CONTRACT
 * Provider: Resend (resend.com) — preferred
 * Required env vars: RESEND_API_KEY, EMAIL_FROM
 * Fallback: console.log when RESEND_API_KEY is absent (dev only)
 * sendEmail() always logs before sending
 * sendEmail() throws on API error — callers MUST catch and handle
 * Raw tokens NEVER stored in DB — only SHA-256 hash
 * NEXT_PUBLIC_APP_URL used for verification links
 */
import { Resend } from 'resend'

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

function logEmail(options: EmailOptions): void {
  console.log(
    `[email:dev] TO=${options.to} SUBJECT="${options.subject}"\n` +
      `[email:dev] Set RESEND_API_KEY in .env to send real emails.\n` +
      options.html.replace(/<[^>]+>/g, '').trim().slice(0, 300),
  )
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

  if (!apiKey) {
    // Dev fallback — print to console so verify URL is visible in server logs
    logEmail(options)
    return
  }

  console.log(`[Email] Sending to: ${options.to} subject: "${options.subject}"`)

  const resend = new Resend(apiKey)
  const { data, error } = await resend.emails.send({
    from,
    //to is hardcoded until domain is created and verified on Resend — otherwise emails are blocked
    to: "shyam.goshike@gmail.com",//[options.to],
    subject: options.subject,
    html: options.html,
  })

  if (error) {
    console.error('[Email] Resend API error:', error)
    throw new Error(`Email send failed: ${(error as any).message ?? JSON.stringify(error)}`)
  }

  console.log('[Email] Sent successfully. ID:', data?.id)
}

// ── Specific email templates ──────────────────────────────────────────────────

export async function sendTeacherVerificationEmail(
  to: string,
  name: string,
  token: string,
): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/teacher/verify-email?token=${token}`
  await sendEmail({
    to,
    subject: 'Verify your School Assistant teacher account',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#006e2f">Welcome to School Assistant, ${name}!</h2>
        <p>Please verify your email address to activate your teacher account.</p>
        <a href="${url}"
           style="display:inline-block;padding:12px 24px;background:#006e2f;color:#fff;
                  border-radius:8px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:13px;margin-top:24px">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>`,
  })
}

export async function sendAssignmentReminderEmail(params: {
  parentEmail: string
  childName: string
  teacherName: string
  subject: string
  topic: string
  dueDate: Date
  appUrl?: string
}): Promise<void> {
  const due = params.dueDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const url = `${params.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/assignments`
  await sendEmail({
    to: params.parentEmail,
    subject: `Reminder: ${params.childName}'s ${params.subject} assignment is due on ${due}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#006e2f">Assignment Reminder</h2>
        <p>Hello,</p>
        <p><strong>${params.teacherName}</strong> has assigned a <strong>${params.subject}</strong>
           assignment on <em>${params.topic}</em> to <strong>${params.childName}</strong>.</p>
        <p><strong>Due date:</strong> ${due}</p>
        <p>Please encourage ${params.childName} to complete the assignment on time.</p>
        <a href="${url}"
           style="display:inline-block;padding:12px 24px;background:#006e2f;color:#fff;
                  border-radius:8px;text-decoration:none;font-weight:600">
          View Assignment
        </a>
        <p style="color:#6b7280;font-size:13px;margin-top:24px">
          — School Assistant
        </p>
      </div>`,
  })
}

export async function sendDueDateExtensionEmail(params: {
  parentEmail: string
  childName: string
  teacherName: string
  subject: string
  topic: string
  newDueDate: Date
}): Promise<void> {
  const due = params.newDueDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  await sendEmail({
    to: params.parentEmail,
    subject: `Due date extended: ${params.childName}'s ${params.subject} assignment`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#0058be">Due Date Extended</h2>
        <p>Hello,</p>
        <p><strong>${params.teacherName}</strong> has extended the due date for the
           <strong>${params.subject}</strong> assignment on <em>${params.topic}</em>
           for <strong>${params.childName}</strong>.</p>
        <p><strong>New due date:</strong> ${due}</p>
        <p style="color:#6b7280;font-size:13px;margin-top:24px">
          — School Assistant
        </p>
      </div>`,
  })
}
