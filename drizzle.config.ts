import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	dialect: 'sqlite',
	schema: [
		'./src/db/user.schema.ts',
		'./src/db/otp.schema.ts',
		'./src/db/refreshToken.schema.ts'
	],
	out: './src/migrations'
})
