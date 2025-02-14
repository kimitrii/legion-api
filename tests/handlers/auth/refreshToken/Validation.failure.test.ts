import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Refresh Token Input Validation E2E', () => {
	const db = drizzle(env.DB)

	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	afterEach(async () => {
		await db.delete(users)
	})

	test('should fail with undefined accessToken', async () => {
		const payload = JSON.stringify({
			accessToken: 123
		})

		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					'User-Agent': 'Vitest',
					Cookie:
						'refreshToken=324234234; Max-Age=2332800; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict'
				},
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
				field: 'accessToken'
			}
		})
	})

	test('should fail with accessToken undefined', async () => {
		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					'User-Agent': 'Vitest',
					Cookie:
						'refreshToken=324234234; Max-Age=2332800; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict'
				}
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
				field: 'accessToken'
			}
		})
	})

	test('should fail with undefined refreshToken', async () => {
		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					Authorization: 'Bearer Mocktoken',
					'User-Agent': 'Vitest'
				}
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				cause: 'is not min',
				field: 'refreshToken'
			}
		})
	})

	test('should fail with less them min refreshToken', async () => {
		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					'User-Agent': 'Vitest',
					Authorization: 'Bearer Mocktoken',
					Cookie:
						'refreshToken=; Max-Age=2332800; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict'
				}
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				cause: 'is not min',
				field: 'refreshToken'
			}
		})
	})
})
