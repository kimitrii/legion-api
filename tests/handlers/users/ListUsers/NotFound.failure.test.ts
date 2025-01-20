import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('List Users failure tests', () => {
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

	test('should fail when theres no users in database - E2E', async () => {
		const res = await app.request(
			'/users?page=1',
			{
				method: 'GET',
				headers
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(404)
		expect(result).toStrictEqual({
			success: false,
			message: 'No users found!'
		})
	})
})
