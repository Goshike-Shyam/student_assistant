/**
 * POST /api/feedback/upload
 * Accepts: multipart/form-data
 * File field name: attachment
 * Allowed types: jpg, jpeg, png, doc, docx
 * Max size: 5MB
 * Returns: { url, name }
 * Auth: any logged-in role (validated by feedback submit route)
 */
import { NextRequest, NextResponse } from 'next/server'
import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const MAX_SIZE = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('attachment') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, and DOC files allowed' },
        { status: 400 },
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'feedback')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(join(uploadDir, safeName), buffer)

    return NextResponse.json({
      url: `/uploads/feedback/${safeName}`,
      name: file.name,
    })
  } catch (err) {
    console.error('[Upload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
