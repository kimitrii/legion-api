import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { sign } from 'hono/jwt'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Update User Auth E2E', () => {
	const db = drizzle(env.DB)

	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	afterEach(async () => {
		await db.delete(users)
	})

	test('should fail if authorization token is missing', async () => {
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

		const payload = JSON.stringify({
			name: 'Mary Doe',
			username: 'marydoe123',
			email: 'marydoe@example.com'
		})

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token'
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

		expect(res.status).toBe(401)
		expect(result).toStrictEqual({
			success: false,
			message: 'Authorization token is missing.'
		})
	})

	test('should fail if authorization token is invalid', async () => {
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

		const payload = JSON.stringify({
			name: 'Mary Doe',
			username: 'marydoe123',
			email: 'marydoe@example.com'
		})

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: 'invalid token'
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

		expect(res.status).toBe(401)
		expect(result).toStrictEqual({
			success: false,
			message: 'invalid JWT token: token'
		})
	})

	test('should fail if authorization token is expired', async () => {
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

		const payload = JSON.stringify({
			name: 'Mary Doe',
			username: 'marydoe123',
			email: 'marydoe@example.com'
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) - 60
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

		expect(res.status).toBe(401)
		expect(result).toStrictEqual({
			success: false,
			message: `token (${accessToken}) expired`
		})
	})

	test('should fail if JWT algorithm is not implemented', async () => {
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

		const payload = JSON.stringify({
			name: 'Mary Doe',
			username: 'marydoe123',
			email: 'marydoe@example.com'
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60
		}
		const accessToken = await sign(
			payloadAccessToken,
			env.USER_SECRET_KEY,
			'HS512'
		)

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

		expect(res.status).toBe(401)
		expect(result).toStrictEqual({
			success: false,
			message: `token(${accessToken}) signature mismatched`
		})
	})

	test('should fail if JWT issued at (iat) is invalid', async () => {
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

		const payload = JSON.stringify({
			name: 'Mary Doe',
			username: 'marydoe123',
			email: 'marydoe@example.com'
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000) + 60,
			exp: Math.floor(Date.now() / 1000) + 60
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

		const result: { message: string; success: string } = await res.json()

		expect(res.status).toBe(401)
		expect(result.success).toBe(false)
		expect(result.message).toMatch(
			/Incorrect "iat" claim must be a older than "[0-9]+" \(iat: "[0-9]+"\)/
		)
	})

	test('should fail if JWT token not before (nbf) is invalid', async () => {
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

		const payload = JSON.stringify({
			name: 'Mary Doe',
			username: 'marydoe123',
			email: 'marydoe@example.com'
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60,
			nbf: Math.floor(Date.now() / 1000) + 60
		}
		const accessToken = await sign(
			payloadAccessToken,
			env.USER_SECRET_KEY,
			'HS512'
		)

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

		expect(res.status).toBe(401)
		expect(result).toStrictEqual({
			success: false,
			message: `token (${accessToken}) is being used before it's valid`
		})
	})
})
