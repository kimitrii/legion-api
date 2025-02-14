import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { sign } from 'hono/jwt'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Refresh Token Validate Token failure cases E2E', () => {
	const db = drizzle(env.DB)

	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	afterEach(async () => {
		await db.delete(users)
	})

	test('should fail with undefined sub at accessToken', async () => {
		const payloadAccessToken = {
			sub: undefined,
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
		const refreshTokenGen = await sign(
			payloadRefreshToken,
			env.REFRESH_SECRET_KEY
		)

		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					'User-Agent': 'Vitest',
					Authorization: `Bearer ${accessTokenGen}`,
					Cookie: `refreshToken=${refreshTokenGen}; Max-Age=2332800; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict`
				}
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(403)
		expect(result).toStrictEqual({
			success: false,
			message: 'Action Denied!'
		})
	})

	test('should fail with undefined iss at accessToken', async () => {
		const payloadAccessToken = {
			sub: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: undefined,
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
		const refreshTokenGen = await sign(
			payloadRefreshToken,
			env.REFRESH_SECRET_KEY
		)

		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					'User-Agent': 'Vitest',
					Authorization: `Bearer ${accessTokenGen}`,
					Cookie: `refreshToken=${refreshTokenGen}; Max-Age=2332800; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict`
				}
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(403)
		expect(result).toStrictEqual({
			success: false,
			message: 'Action Denied!'
		})
	})

	test('should fail with undefined iss is not equal AUTH_ISSUER at accessToken', async () => {
		const payloadAccessToken = {
			sub: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: 'not-Auth_issuer',
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
		const refreshTokenGen = await sign(
			payloadRefreshToken,
			env.REFRESH_SECRET_KEY
		)

		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					'User-Agent': 'Vitest',
					Authorization: `Bearer ${accessTokenGen}`,
					Cookie: `refreshToken=${refreshTokenGen}; Max-Age=2332800; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict`
				}
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(403)
		expect(result).toStrictEqual({
			success: false,
			message: 'Action Denied!'
		})
	})

	test('should fail with undefined sub at refreshToken', async () => {
		const payloadAccessToken = {
			sub: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60
		}

		const payloadRefreshToken = {
			sub: undefined,
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
		}

		const accessTokenGen = await sign(payloadAccessToken, env.USER_SECRET_KEY)
		const refreshTokenGen = await sign(
			payloadRefreshToken,
			env.REFRESH_SECRET_KEY
		)

		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					'User-Agent': 'Vitest',
					Authorization: `Bearer ${accessTokenGen}`,
					Cookie: `refreshToken=${refreshTokenGen}; Max-Age=2332800; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict`
				}
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(403)
		expect(result).toStrictEqual({
			success: false,
			message: 'Action Denied!'
		})
	})

	test('should fail with undefined iss at refreshToken', async () => {
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
			iss: undefined,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
		}

		const accessTokenGen = await sign(payloadAccessToken, env.USER_SECRET_KEY)
		const refreshTokenGen = await sign(
			payloadRefreshToken,
			env.REFRESH_SECRET_KEY
		)

		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					'User-Agent': 'Vitest',
					Authorization: `Bearer ${accessTokenGen}`,
					Cookie: `refreshToken=${refreshTokenGen}; Max-Age=2332800; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict`
				}
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(403)
		expect(result).toStrictEqual({
			success: false,
			message: 'Action Denied!'
		})
	})

	test('should fail with undefined iss is not equal AUTH_ISSUER at accessToken', async () => {
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
			iss: 'not-Auth_issuer',
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
		}

		const accessTokenGen = await sign(payloadAccessToken, env.USER_SECRET_KEY)
		const refreshTokenGen = await sign(
			payloadRefreshToken,
			env.REFRESH_SECRET_KEY
		)

		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					'User-Agent': 'Vitest',
					Authorization: `Bearer ${accessTokenGen}`,
					Cookie: `refreshToken=${refreshTokenGen}; Max-Age=2332800; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict`
				}
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(403)
		expect(result).toStrictEqual({
			success: false,
			message: 'Action Denied!'
		})
	})
})
