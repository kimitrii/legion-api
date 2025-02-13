import { applyD1Migrations, env } from 'cloudflare:test'
import { refreshToken } from '@src/db/refreshToken.schema'
import { users } from '@src/db/user.schema'
import { RefreshToken } from '@src/entities/RefreshToken.Entity'
import app from '@src/index'
import { WebCryptoAES } from '@src/lib/webCryptoAES'
import { drizzle } from 'drizzle-orm/d1'
import { sign } from 'hono/jwt'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Refresh Token success cases handler E2E', () => {
	const db = drizzle(env.DB)

	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	afterEach(async () => {
		await db.delete(users)
	})

	test('should refresh token successfully', async () => {
		const webCryptoAES = new WebCryptoAES({ secret: env.REFRESH_AES_KEY })

		const payloadAccessToken = {
			sub: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) - 60
		}

		const payloadRequestRefreshToken = {
			sub: '01JHBDWAXFPAKAFK38E1MAM01W',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
		}

		const generatedAccessToken = await sign(
			payloadAccessToken,
			env.USER_SECRET_KEY
		)

		const refreshTokenInstances: RefreshToken[] = []
		let generatedRefreshToken = ''

		const totalRefreshTokens = 3

		for (let i = 0; i < totalRefreshTokens; i++) {
			const payloadRefreshTokena =
				i === totalRefreshTokens - 1
					? payloadRequestRefreshToken
					: {
							sub: '01JHBDWAXFPAKAFK38E1MAM01W',
							iss: env.AUTH_ISSUER,
							iat: Math.floor(Date.now() / 1000),
							exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 + (i + 1)
						}

			const refreshTokenGen = await sign(
				payloadRefreshTokena,
				env.REFRESH_SECRET_KEY
			)

			const encryptedRefreshToken =
				(await webCryptoAES.encryptSymetric(refreshTokenGen)).cipherText ?? ''

			if (i === totalRefreshTokens - 1) {
				generatedRefreshToken = refreshTokenGen
			}
			const expirationDate = new Date()
			expirationDate.setMonth(expirationDate.getMonth() + 1)
			expirationDate.setSeconds(expirationDate.getSeconds() + (1 + i))

			const refreshTokenData = {
				token: encryptedRefreshToken,
				revoked: false,
				userAgent: 'Vitest',
				userId: '01JHBDWAXFPAKAFK38E1MAM01W',
				expiresAt: expirationDate.toISOString(),
				createdAt: expirationDate.toISOString()
			}

			const refreshTokenInstance = new RefreshToken(refreshTokenData)

			refreshTokenInstances.push(refreshTokenInstance)
		}

		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			email: 'johndoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		await db.insert(refreshToken).values(refreshTokenInstances)

		const payload = JSON.stringify({
			accessToken: generatedAccessToken
		})

		const res = await app.request(
			'/users/auth/refresh',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					'User-Agent': 'Vitest',
					Cookie: `refreshToken=${generatedRefreshToken}; Max-Age=2332800; Path=/users/auth/refresh; HttpOnly; Secure; SameSite=Strict`
				},
				body: payload
			},
			env
		)

		const result = await res.json()

		const cookies = res.headers.getSetCookie()[0]
		const token = cookies.split('refreshToken=')[1]?.split(';')[0] || null

		const tokenDB = await db.select().from(refreshToken)

		const decryptedTokenDb = await webCryptoAES.decryptSymetric(
			tokenDB[refreshTokenInstances.length - 1].token
		)

		const refreshTokenRegex = cookies.match(/refreshToken=([^;]+)/)?.[1]
		const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/

		expect(tokenDB[refreshTokenInstances.length - 1].revoked).toBe(true)
		expect(token).toBe(decryptedTokenDb.plainText)
		expect(res.status).toBe(200)
		expect(cookies).toMatch(/refreshToken=/)
		expect(cookies).toMatch(/HttpOnly/)
		expect(cookies).toMatch(/Path=\/users\/auth\/refresh/)
		expect(cookies).toMatch(/Secure/)
		expect(cookies).toMatch(/SameSite=Strict/)
		expect(cookies).toMatch(/Max-Age=2332800/)
		expect(refreshTokenRegex).toMatch(jwtRegex)
		expect(result).toStrictEqual({
			success: true,
			message: 'Token refreshed successfully',
			data: {
				id: '01JHBDWAXFPAKAFK38E1MAM01W',
				name: 'John Doe',
				username: 'johndoe123',
				email: 'johndoe@example.com',
				token: {
					accessToken: expect.stringMatching(jwtRegex),
					expiresIn: expect.any(Number)
				}
			}
		})
	})
})
