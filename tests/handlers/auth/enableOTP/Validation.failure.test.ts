import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Enable user otp validation input - E2E', () => {
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

	test('should should fail with max token length', async () => {
		const payload = JSON.stringify({
			token: 123456
		})

		const res = await app.request(
			'/users/01JHBDWAXFPAKAFK38E1MAM01W/otp',
			{
				method: 'PUT',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				cause: 'is not string',
				field: 'token'
			}
		})
	})

	test('should should fail with invalid token type', async () => {
		const payload = JSON.stringify({
			token: '12345678910'
		})

		const res = await app.request(
			'/users/01JHBDWAXFPAKAFK38E1MAM01W/otp',
			{
				method: 'PUT',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				cause: 'is not max',
				field: 'token'
			}
		})
	})

	test('should should fail with invalid user id', async () => {
		const payload = JSON.stringify({
			token: '12345678910'
		})

		const res = await app.request(
			'/users/invalid-id/otp',
			{
				method: 'PUT',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				cause: 'is not ulid',
				field: 'userId'
			}
		})
	})
})
