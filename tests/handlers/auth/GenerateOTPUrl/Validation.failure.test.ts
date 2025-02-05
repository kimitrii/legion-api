import { applyD1Migrations, env } from 'cloudflare:test'
import { otps } from '@src/db/otp.schema'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { Totp } from '@src/lib/totp'
import { WebCryptoAES } from '@src/lib/webCryptoAES'
import { drizzle } from 'drizzle-orm/d1'
import { sign } from 'hono/jwt'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Get user otp url validation handler E2E', () => {
	const db = drizzle(env.DB)

	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	afterEach(async () => {
		await db.delete(users)
	})

	test('should fail with invalid user id', async () => {
		const totp = new Totp()
		const webCryptoAES = new WebCryptoAES({ secret: env.OTP_SECRET })

		const date = new Date().toISOString()

		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			email: 'johndoe@example.com',
			isTotpEnable: false,
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		const secret = totp.generateSecret({
			algorithm: 'SHA256',
			service: 'LegionKimitri',
			user: 'johndoe123'
		})

		const encryptedSecret = await webCryptoAES.encryptSymetric(
			secret.secret ?? ''
		)

		await db.insert(otps).values({
			id: '01JK4JKV50GPZ8R32DP399WGRQ',
			otpHash: encryptedSecret.cipherText ?? '',
			userId: '01JHBDWAXFPAKAFK38E1MAM01W',
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

		const res = await app.request(
			'/users/invalid-id/otp/secret',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': 'mock-csrf-token',
					authorization: `Bearer ${accessToken}`
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
				cause: 'is not ulid',
				field: 'id'
			}
		})
	})
})
