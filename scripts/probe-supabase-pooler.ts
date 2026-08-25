import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const projectRef = 'gwkfegybtmmcdxnfnkyj'
const password = 'C%40li4nia%242016'
const clusterPrefixes = ['aws-0', 'aws-1', 'aws-2']
const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-northeast-1',
  'us-east-1',
  'us-west-1',
  'eu-west-1',
  'eu-central-1',
]

const users = [
  `postgres.${projectRef}`,
  `${projectRef}.postgres`,
  `${projectRef}`,
  'postgres',
]

function buildUrl(clusterPrefix: string, region: string, user: string): string {
  return `postgresql://${user}:${password}@${clusterPrefix}-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require`
}

async function testUrl(url: string): Promise<string> {
  const prisma = new PrismaClient({
    datasources: { db: { url } },
  })

  try {
    await prisma.$queryRawUnsafe('SELECT 1')
    return 'OK'
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return message.replace(/\s+/g, ' ').slice(0, 220)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  for (const clusterPrefix of clusterPrefixes) {
    for (const region of regions) {
      for (const user of users) {
        const url = buildUrl(clusterPrefix, region, user)
        const result = await testUrl(url)
        console.log(`${clusterPrefix}-${region} | ${user} | ${result}`)
        if (result === 'OK') {
          console.log(`\nWORKING_URL=${url}`)
          return
        }
      }
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
