import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Update User failure tests', () => {
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

	test('should fail when user with username already exists - E2E', async () => {
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com',
			isActive: true,
			isDeleted: false,
			kats: 0,
			rank: 0,
			createdAt: new Date().toISOString()
		})

		await db.insert(users).values({
			id: '01JHQREHTPYRX3390EVFXX47N3',
			name: 'Mary Doe',
			username: 'marydoe123',
			password: 'secureP@ssw0rd!',
			email: 'marydoe@example.com',
			isActive: true,
			isDeleted: false,
			kats: 0,
			rank: 0,
			createdAt: new Date().toISOString()
		})

		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'marydoe123'
		})

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

		expect(res.status).toBe(409)
		expect(result).toStrictEqual({
			success: false,
			message: 'This user already exists',
			cause: {
				username: 'marydoe123'
			}
		})
	})

	test('should fail when user with email already exists - E2E', async () => {
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com',
			isActive: true,
			isDeleted: false,
			kats: 0,
			rank: 0,
			createdAt: new Date().toISOString()
		})

		await db.insert(users).values({
			id: '01JHQREHTPYRX3390EVFXX47N3',
			name: 'Mary Doe',
			username: 'marydoe123',
			password: 'secureP@ssw0rd!',
			email: 'marydoe@example.com',
			isActive: true,
			isDeleted: false,
			kats: 0,
			rank: 0,
			createdAt: new Date().toISOString()
		})

		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe1234',
			email: 'marydoe@example.com'
		})

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

		expect(res.status).toBe(409)
		expect(result).toStrictEqual({
			success: false,
			message: 'This user already exists',
			cause: {
				email: 'marydoe@example.com'
			}
		})
	})
})
