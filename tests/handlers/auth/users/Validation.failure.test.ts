import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('User authentication Input Validation - E2E', () => {
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

	test('should fail when just password is provided', async () => {
		const payload = JSON.stringify({
			password: 'secureP@ssw0rd!'
		})

		const res = await app.request(
			'/users/login',
			{
				method: 'POST',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Either email or username must be provided.'
		})
	})

	test('should fail when password is not provided', async () => {
		const payload = JSON.stringify({
			email: 'johndoe@example.com'
		})

		const res = await app.request(
			'/users/login',
			{
				method: 'POST',
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
				cause: 'is not nullable',
				field: 'password'
			}
		})
	})

	test('should fail when email is not email format', async () => {
		const payload = JSON.stringify({
			email: 'johndoe',
			password: 'secureP@ssw0rd!'
		})

		const res = await app.request(
			'/users/login',
			{
				method: 'POST',
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
				cause: 'is not email',
				field: 'email'
			}
		})
	})

	test('should fail when body is empty', async () => {
		const res = await app.request(
			'/users/login',
			{
				method: 'POST',
				headers
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Invalid JSON format in request body'
		})
	})

	test('should fail when email and username is not provided', async () => {
		const payload = JSON.stringify({})

		const res = await app.request(
			'/users/login',
			{
				method: 'POST',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Either email or username must be provided.'
		})
	})
})
