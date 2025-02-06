import crypto from 'node:crypto'
import { applyD1Migrations, env } from 'cloudflare:test'
import { otps } from '@src/db/otp.schema'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { Totp } from '@src/lib/totp'
import { WebCryptoAES } from '@src/lib/webCryptoAES'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('User OTP authentication handler E2E', () => {
	const db = drizzle(env.DB)

	function generateToken(secret: string, counter: number): string {
		const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
		let bits = ''

		for (const char of secret.toUpperCase()) {
			const index = base32Chars.indexOf(char)
			if (index === -1) {
				throw new Error('Invalid Base32 secret')
			}
			bits += index.toString(2).padStart(5, '0')
		}

		const bytes = []
		for (let i = 0; i < bits.length; i += 8) {
			bytes.push(Number.parseInt(bits.slice(i, i + 8).padEnd(8, '0'), 2))
		}

		const key = Buffer.from(bytes)
		const buffer = Buffer.alloc(8)

		let localCounter = counter
		for (let i = 7; i >= 0; i--) {
			buffer[i] = localCounter & 0xff
			localCounter >>= 8
		}

		const hmac = crypto.createHmac('sha256', key).update(buffer).digest()
		const offset = hmac[hmac.length - 1] & 0xf
		const code =
			((hmac[offset] & 0x7f) << 24) |
			((hmac[offset + 1] & 0xff) << 16) |
			((hmac[offset + 2] & 0xff) << 8) |
			(hmac[offset + 3] & 0xff)

		return (code % 10 ** 6).toString().padStart(6, '0')
	}

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

	test('should authenticate user successfully with username and token', async () => {
		const totp = new Totp()
		const webCryptoAES = new WebCryptoAES({ secret: env.OTP_SECRET })

		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			email: 'johndoe@example.com',
			isActive: true,
			isTotpEnable: true,
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

		const currentTime = Math.floor(Date.now() / 1000 / 30)

		const token = generateToken(secret.secret ?? '', currentTime)

		const payload = JSON.stringify({
			username: 'johndoe123',
			token
		})

		const res = await app.request(
			'/users/otp/login',
			{
				method: 'POST',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/

		expect(res.status).toBe(200)
		expect(result).toStrictEqual({
			success: true,
			message: 'User authenticated successfully',
			data: {
				id: '01JHBDWAXFPAKAFK38E1MAM01W',
				name: 'John Doe',
				username: 'johndoe123',
				email: 'johndoe@example.com',
				token: {
					accessToken: expect.stringMatching(jwtRegex),
					refreshToken: expect.stringMatching(jwtRegex),
					expiresIn: expect.any(Number)
				}
			}
		})
	})

	test('should authenticate user successfully with email and token', async () => {
		const totp = new Totp()
		const webCryptoAES = new WebCryptoAES({ secret: env.OTP_SECRET })

		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			email: 'johndoe@example.com',
			isActive: true,
			isTotpEnable: true,
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

		const currentTime = Math.floor(Date.now() / 1000 / 30)

		const token = generateToken(secret.secret ?? '', currentTime)

		const payload = JSON.stringify({
			email: 'johndoe@example.com',
			token
		})

		const res = await app.request(
			'/users/otp/login',
			{
				method: 'POST',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/

		expect(res.status).toBe(200)
		expect(result).toStrictEqual({
			success: true,
			message: 'User authenticated successfully',
			data: {
				id: '01JHBDWAXFPAKAFK38E1MAM01W',
				name: 'John Doe',
				username: 'johndoe123',
				email: 'johndoe@example.com',
				token: {
					accessToken: expect.stringMatching(jwtRegex),
					refreshToken: expect.stringMatching(jwtRegex),
					expiresIn: expect.any(Number)
				}
			}
		})
	})
})
