import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { sign } from 'hono/jwt'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Refresh Token signature failure cases E2E', () => {
	const db = drizzle(env.DB)

	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	afterEach(async () => {
		await db.delete(users)
	})

	test('should fail with accessToken wrong invalid access token signature', async () => {
		const payloadAccessToken = {
			sub: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60
		}

		const payloadRefreshToken = {
			sub: '01JHBDWAXFPAKAFK38E1MAM01W',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
		}

		const accessTokenGen = await sign(payloadAccessToken, 'invalid-signature')
		const refreshTokenGen = await sign(
			payloadRefreshToken,
			env.REFRESH_SECRET_KEY
		)

		const payload = JSON.stringify({
			accessToken: accessTokenGen
		})

		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					'User-Agent': 'Vitest',
					Cookie: `refreshToken=${refreshTokenGen}; Max-Age=2332800; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict`
				},
				body: payload
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(401)
		expect(result).toStrictEqual({
			success: false,
			message: 'Access Denied!'
		})
	})

	test('should fail with accessToken wrong invalid refresh token signature', async () => {
		const payloadAccessToken = {
			sub: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60
		}

		const payloadRefreshToken = {
			sub: '01JHBDWAXFPAKAFK38E1MAM01W',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
		}

		const accessTokenGen = await sign(payloadAccessToken, env.USER_SECRET_KEY)
		const refreshTokenGen = await sign(payloadRefreshToken, 'invalid-signature')

		const payload = JSON.stringify({
			accessToken: accessTokenGen
		})

		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					'User-Agent': 'Vitest',
					Cookie: `refreshToken=${refreshTokenGen}; Max-Age=2332800; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict`
				},
				body: payload
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(401)
		expect(result).toStrictEqual({
			success: false,
			message: 'Access Denied!'
		})
	})
})
