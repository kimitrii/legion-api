import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Delete User handler E2E', () => {
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

	test('should delete user successfully', async () => {
		const date = new Date().toISOString()
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
			createdAt: date
		})

		const res = await app.request(
			'/users/01JHBDWAXFPAKAFK38E1MAM01W',
			{
				method: 'DELETE',
				headers
			},
			env
		)

		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, '01JHBDWAXFPAKAFK38E1MAM01W'))
			.limit(1)

		const result = await res.json()

		expect(res.status).toBe(200)
		expect(result).toStrictEqual({
			success: true,
			message: 'User deleted successfully',
			data: {
				id: '01JHBDWAXFPAKAFK38E1MAM01W',
				name: 'John Doe',
				username: 'johndoe123',
				email: 'johndoe@example.com',
				kats: 0,
				rank: 0,
				isActive: false,
				deletedAt: user[0].deletedAt,
				createdAt: date
			}
		})
	})
})
