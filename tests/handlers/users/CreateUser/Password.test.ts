import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('User password encryption - E2E', () => {
	const db = drizzle(env.DB)

	const headers = {
		'Content-Type': 'application/json',
		'X-CSRF-Token': 'mock-csrf-token'
	}

	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	afterEach(async () => {
		await db.delete(users)
	})

	test('should save encrypted password in database with bcrypt', async () => {
		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe123',
			isTotpEnable: false,
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com'
		})

		await app.request(
			'/users',
			{
				method: 'POST',
				headers,
				body: payload
			},
			env
		)

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, 'johndoe@example.com'))
			.limit(1)

		expect(await bcrypt.compare('secureP@ssw0rd!', user.password ?? '')).toBe(
			true
		)
		expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/)
		expect(user.password).not.toBe('secureP@ssw0rd!')
	})
})
