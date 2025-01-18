import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Delete User Input CSRF - E2E', () => {
	const db = drizzle(env.DB)

	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	afterEach(async () => {
		await db.delete(users)
	})

	test('should fail when content-type is not application/json', async () => {
		const res = await app.request(
			'/users/01JHBDWAXFPAKAFK38E1MAM01W',
			{
				method: 'DELETE'
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(403)
		expect(result).toStrictEqual({
			success: false,
			message: 'Access denied.'
		})
	})
})
