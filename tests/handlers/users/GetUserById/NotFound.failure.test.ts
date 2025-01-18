import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Get User By Id failure tests', () => {
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

	test('should fail when user id no exists - E2E', async () => {
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
			createdAt: new Date().toISOString()
		})

		const res = await app.request(
			'/users/01JHBDWAXFPAKAFK38E1MAM01B',
			{
				method: 'GET',
				headers
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(404)
		expect(result).toStrictEqual({
			success: false,
			message: 'User not founded!',
			cause: {
				id: '01JHBDWAXFPAKAFK38E1MAM01B'
			}
		})
	})

	test('should fail when user is deleted - E2E', async () => {
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com',
			isActive: true,
			kats: 0,
			rank: 0,
			deletedAt: new Date().toISOString(),
			createdAt: new Date().toISOString()
		})

		const res = await app.request(
			'/users/01JHBDWAXFPAKAFK38E1MAM01W',
			{
				method: 'GET',
				headers
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(404)
		expect(result).toStrictEqual({
			success: false,
			message: 'User has been deleted!',
			cause: {
				id: '01JHBDWAXFPAKAFK38E1MAM01W'
			}
		})
	})
})
