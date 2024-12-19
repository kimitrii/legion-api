import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	dialect: 'sqlite',
	schema: ['./src/db/user.schema.ts'],
	out: './src/migrations'
})
