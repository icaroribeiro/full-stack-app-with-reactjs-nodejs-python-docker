import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const migrateDatabase = async () => {
  const args = process.argv.slice(2)
  const dirArg = args.find((arg) => arg.startsWith('--dir='))
  const dirname = dirArg ? dirArg.split('=')[1] : ''
  let migrationClient
  try {
    const databaseURL = process.env['DATABASE_URL']
      ? process.env.DATABASE_URL
      : ''
    migrationClient = postgres(databaseURL, { max: 1 })
    console.log('Migration client created successfully!')
  } catch (error) {
    console.error('Migration client creation failed!', error)
    process.exit(1)
  }
  try {
    const migrationsFolder = dirname
    await migrate(drizzle(migrationClient), {
      migrationsFolder: migrationsFolder,
    })
    console.log('Migrations completed successfully!')
    await migrationClient.end()
    process.exit(0)
  } catch (error) {
    console.error('Migrations failed!', error)
    process.exit(1)
  }
}

migrateDatabase()
