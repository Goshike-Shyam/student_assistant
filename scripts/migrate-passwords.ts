import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const COST = 12
const BATCH = 50

function isAlreadyHashed(pw: string | null | undefined): boolean {
  if (!pw) return false
  return pw.startsWith('$2b$') || pw.startsWith('$2a$')
}

async function migrateTable(table: 'child' | 'parent', pwField: string) {
  console.log(`\n── Migrating ${table}s ──`)

  const records =
    table === 'child'
      ? await prisma.user.findMany({ select: { id: true as any, [pwField]: true } })
      : await prisma.user.findMany({ select: { id: true as any, [pwField]: true } })

  const toMigrate = records.filter((r: any) => r[pwField] && !isAlreadyHashed(r[pwField]))

  console.log(
    `  Total: ${records.length} | To migrate: ${toMigrate.length} | Already hashed: ${records.length - toMigrate.length}`,
  )

  if (toMigrate.length === 0) {
    console.log('  ✓ Nothing to migrate')
    return
  }

  let migrated = 0
  let failed = 0

  for (let i = 0; i < toMigrate.length; i += BATCH) {
    const batch = toMigrate.slice(i, i + BATCH)

    await Promise.all(
      batch.map(async (record: any) => {
        try {
          const hash = await bcrypt.hash(record[pwField], COST)
          await prisma.user.update({ where: { id: record.id }, data: { [pwField]: hash } as any })
          migrated++
        } catch (err) {
          console.error(`  ✗ Failed ID ${record.id}:`, (err as any)?.message ?? err)
          failed++
        }
      }),
    )

    console.log(`  Progress: ${Math.min(i + BATCH, toMigrate.length)}/${toMigrate.length} processed`)
  }

  console.log(`  ✓ Migrated: ${migrated} | ✗ Failed: ${failed}`)
}

async function run() {
  console.log('Password Migration Starting...')
  console.log('bcrypt cost factor:', COST)
  console.log('Batch size:', BATCH)

  try {
    // Adjust field name if different — current schema uses `password` on `User`
    await migrateTable('child', 'password')
    await migrateTable('parent', 'password')

    console.log('\n✓ Migration complete!')
    console.log('Next step: update signin route to use bcrypt.compare (done automatically by this script set)')
    console.log('Delete scripts/migrate-passwords.ts after successful run')
  } catch (err) {
    console.error('\n✗ Migration failed:', (err as any)?.message ?? err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

run()
