import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { sign } from 'hono/jwt'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Delete User handler isDeleted - E2E', () => {
	const db = drizzle(env.DB)

	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	afterEach(async () => {
		await db.delete(users)
	})

	test('should fail if id not found', async () => {
		const date = new Date().toISOString()
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
			createdAt: date
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
			'/users/01JHT92033GDR5JBP49R4QC4C5',
			{
				method: 'DELETE',
				headers
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(404)
		expect(result).toStrictEqual({
			success: false,
			message: 'User not founded!',
			cause: {
				id: '01JHT92033GDR5JBP49R4QC4C5'
			}
		})
	})

	test('should fail if user already deleted and not restored', async () => {
		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com',
			isActive: true,
			deletedAt: '2025-01-17T14:04:16.234Z',
			kats: 0,
			rank: 0,
			restoredAt: null,
			createdAt: date
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
				method: 'DELETE',
				headers
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(404)
		expect(result).toStrictEqual({
			success: false,
			message: 'This user has been deleted!',
			cause: {
				id: '01JHBDWAXFPAKAFK38E1MAM01W'
			}
		})
	})
})
