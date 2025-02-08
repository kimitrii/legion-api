import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('User authentication handler E2E', () => {
	const db = drizzle(env.DB)

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

	test('should authenticate user successfully with username and password', async () => {
		const encryptedPassword = await bcrypt.hash('secureP@ssw0rd!', 10)

		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: encryptedPassword,
			email: 'johndoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		const payload = JSON.stringify({
			username: 'johndoe123',
			password: 'secureP@ssw0rd!'
		})

		const res = await app.request(
			'/users/login',
			{
				method: 'POST',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		const cookies = res.headers.getSetCookie()[0]

		const refreshTokenRegex = cookies.match(/refreshToken=([^;]+)/)?.[1]
		const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/

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
			message: 'User authenticated successfully',
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

	test('should authenticate user successfully with email and password', async () => {
		const encryptedPassword = await bcrypt.hash('secureP@ssw0rd!', 10)

		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: encryptedPassword,
			email: 'johndoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		const payload = JSON.stringify({
			email: 'johndoe@example.com',
			password: 'secureP@ssw0rd!'
		})

		const res = await app.request(
			'/users/login',
			{
				method: 'POST',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		const cookies = res.headers.getSetCookie()[0]

		const refreshTokenRegex = cookies.match(/refreshToken=([^;]+)/)?.[1]
		const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/

		expect(res.status).toBe(200)
		expect(cookies).toMatch(/refreshToken=/)
		expect(cookies).toMatch(/HttpOnly/)
		expect(cookies).toMatch(/Secure/)
		expect(cookies).toMatch(/Path=\/users\/auth\/refresh/)
		expect(cookies).toMatch(/SameSite=Strict/)
		expect(cookies).toMatch(/Max-Age=2332800/)
		expect(refreshTokenRegex).toMatch(jwtRegex)
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
					expiresIn: expect.any(Number)
				}
			}
		})
	})

	test('should should rehash password on successfully authentication', async () => {
		const encryptedPassword = await bcrypt.hash('secureP@ssw0rd!', 2)

		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: encryptedPassword,
			email: 'johndoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		const payload = JSON.stringify({
			email: 'johndoe@example.com',
			password: 'secureP@ssw0rd!'
		})

		const res = await app.request(
			'/users/login',
			{
				method: 'POST',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()
		const cookies = res.headers.getSetCookie()[0]

		const refreshTokenRegex = cookies.match(/refreshToken=([^;]+)/)?.[1]
		const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/

		const rehashedUser = await db
			.select()
			.from(users)
			.where(eq(users.id, '01JHBDWAXFPAKAFK38E1MAM01W'))
			.limit(1)

		expect(res.status).toBe(200)
		expect(cookies).toMatch(/refreshToken=/)
		expect(cookies).toMatch(/HttpOnly/)
		expect(cookies).toMatch(/Secure/)
		expect(cookies).toMatch(/SameSite=Strict/)
		expect(cookies).toMatch(/Path=\/users\/auth\/refresh/)
		expect(cookies).toMatch(/Max-Age=2332800/)
		expect(refreshTokenRegex).toMatch(jwtRegex)
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
					expiresIn: expect.any(Number)
				}
			}
		})

		expect(bcrypt.getRounds(rehashedUser[0].password ?? '')).toBe(10)
	})
})
