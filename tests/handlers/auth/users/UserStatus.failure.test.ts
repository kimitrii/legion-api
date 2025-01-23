import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('User authentication Status E2E', () => {
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

	test('should fail when user not exists', async () => {
		const payload = JSON.stringify({
			username: 'john Doe',
			password: '123asdf3'
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

		expect(res.status).toBe(404)
		expect(result).toStrictEqual({
			success: false,
			message: 'User not founded!'
		})
	})

	test('should fail when user has been deleted', async () => {
		const encryptedPassword = await bcrypt.hash('secureP@ssw0rd!', 10)

		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: encryptedPassword,
			email: 'johndoe@example.com',
			isActive: true,
			deletedAt: date,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		const payload = JSON.stringify({
			username: 'johndoe123',
			password: '123456789'
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

		expect(res.status).toBe(404)
		expect(result).toStrictEqual({
			success: false,
			message: 'User has been deleted!'
		})
	})

	test('should fail when user is inactive', async () => {
		const encryptedPassword = await bcrypt.hash('secureP@ssw0rd!', 10)

		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: encryptedPassword,
			email: 'johndoe@example.com',
			isActive: false,
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

		expect(res.status).toBe(404)
		expect(result).toStrictEqual({
			success: false,
			message: 'User is inactive!'
		})
	})
})
