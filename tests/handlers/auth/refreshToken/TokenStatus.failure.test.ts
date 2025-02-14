import { applyD1Migrations, env } from 'cloudflare:test'
import { refreshToken } from '@src/db/refreshToken.schema'
import { users } from '@src/db/user.schema'
import { RefreshToken } from '@src/entities/RefreshToken.Entity'
import app from '@src/index'
import { WebCryptoAES } from '@src/lib/webCryptoAES'
import { drizzle } from 'drizzle-orm/d1'
import { sign } from 'hono/jwt'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Refresh Token status failure cases E2E', () => {
	const db = drizzle(env.DB)

	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	afterEach(async () => {
		await db.delete(users)
	})

	test('should fail with not match refresh token', async () => {
		const webCryptoAES = new WebCryptoAES({ secret: env.REFRESH_AES_KEY })

		const payloadAccessToken = {
			sub: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) - 60
		}

		const payloadRefreshToken = {
			sub: '01JHBDWAXFPAKAFK38E1MAM01W',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
		}

		const payloadRefreshDatabase = {
			sub: '01JHBDWAXFPAKAFK38E1MAM01W',
			iss: 'env.AUTH_ISSUER',
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
		}

		const accessTokenGen = await sign(payloadAccessToken, env.USER_SECRET_KEY)
		const refreshTokenGen = await sign(
			payloadRefreshToken,
			env.REFRESH_SECRET_KEY
		)

		const refreshTokenDatabase = await sign(
			payloadRefreshDatabase,
			env.REFRESH_SECRET_KEY
		)

		const now = new Date()
		const expiresTomorrow = new Date(now)

		expiresTomorrow.setDate(expiresTomorrow.getDate() + 1)

		const expiresAt = expiresTomorrow.toISOString()

		const data = {
			token:
				(await webCryptoAES.encryptSymetric(refreshTokenDatabase)).cipherText ??
				'',
			revoked: false,
			userAgent: 'Vitest',
			userId: '01JHBDWAXFPAKAFK38E1MAM01W',
			expiresAt: expiresAt,
			createdAt: new Date().toISOString()
		}

		const refreshTokenInstance = new RefreshToken(data)

		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			email: 'johndoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: now.toISOString()
		})

		await db.insert(refreshToken).values(refreshTokenInstance)

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

		expect(res.status).toBe(401)
		expect(result).toStrictEqual({
			success: false,
			message: 'Access Denied!'
		})
	})
})
