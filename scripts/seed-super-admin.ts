import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.admin.findFirst({ 
    where: { role: 'SUPER_ADMIN' } 
  })
  if (existing) {
    console.log('ℹ️  Super Admin already exists:', existing.email)
    console.log('Use the Admin portal to invite additional admins.')
    process.exit(0)
  }

  // Read credentials from env — never hardcode in script
  const email = process.env.SUPER_ADMIN_EMAIL
  const password = process.env.SUPER_ADMIN_PASSWORD
  const name = process.env.SUPER_ADMIN_NAME ?? 'Super Admin'

  if (!email || !password) {
    console.error('❌ Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD env vars first.')
    process.exit(1)
  }

  if (password.length < 12) {
    console.error('❌ Password must be at least 12 characters.')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const admin = await prisma.admin.create({
    data: { name, email, passwordHash, role: 'SUPER_ADMIN' }
  })

  console.log(`✓ Super Admin created: ${admin.email} (id: ${admin.id})`)
  console.log('Delete SUPER_ADMIN_PASSWORD from your environment now.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
