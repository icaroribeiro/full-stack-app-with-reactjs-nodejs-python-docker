import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schemas/index.ts',
  out: './db/migrations',
  dbCredentials: {
    url: process.env['DATABASE_URL'] ? process.env.DATABASE_URL : '',
  },
})
