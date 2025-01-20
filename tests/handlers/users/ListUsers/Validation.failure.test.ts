import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Get User List Input Validation - E2E', () => {
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

	test('should fail when page is missing', async () => {
		const res = await app.request(
			'/users',
			{
				method: 'GET',
				headers
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'page',
				cause: 'is not number'
			}
		})
	})

	test('should fail when includeDeleted query parameter is not equals true', async () => {
		const res = await app.request(
			'/users?page=1&includeDeleted=false',
			{
				method: 'GET',
				headers
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'includeDeleted',
				cause: 'is not equals'
			}
		})
	})
})
