import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema/*',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/tg_search',
  },
  // Enable vector extension
  strict: true,
  verbose: true,
} satisfies Config 
