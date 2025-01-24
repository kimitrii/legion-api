import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { sign } from 'hono/jwt'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Update User failure tests', () => {
	const db = drizzle(env.DB)

	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	afterEach(async () => {
		await db.delete(users)
	})

	test('should fail when user with username already exists - E2E', async () => {
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: new Date().toISOString()
		})

		await db.insert(users).values({
			id: '01JHQREHTPYRX3390EVFXX47N3',
			name: 'Mary Doe',
			username: 'marydoe123',
			password: 'secureP@ssw0rd!',
			email: 'marydoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: new Date().toISOString()
		})

		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'marydoe123'
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

		const res = await app.request(
			'/users/01JHBDWAXFPAKAFK38E1MAM01W',
			{
				method: 'PUT',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(409)
		expect(result).toStrictEqual({
			success: false,
			message: 'This user already exists',
			cause: {
				username: 'marydoe123'
			}
		})
	})

	test('should fail when user with email already exists - E2E', async () => {
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: new Date().toISOString()
		})

		await db.insert(users).values({
			id: '01JHQREHTPYRX3390EVFXX47N3',
			name: 'Mary Doe',
			username: 'marydoe123',
			password: 'secureP@ssw0rd!',
			email: 'marydoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: new Date().toISOString()
		})

		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe1234',
			email: 'marydoe@example.com'
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

		const res = await app.request(
			'/users/01JHBDWAXFPAKAFK38E1MAM01W',
			{
				method: 'PUT',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(409)
		expect(result).toStrictEqual({
			success: false,
			message: 'This user already exists',
			cause: {
				email: 'marydoe@example.com'
			}
		})
	})
})
