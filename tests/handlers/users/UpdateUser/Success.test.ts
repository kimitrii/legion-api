import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Update User handler E2E', () => {
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

	test('should update user successfully with username, password and email', async () => {
		const date = new Date().toISOString()
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
			createdAt: date
		})

		const payload = JSON.stringify({
			name: 'Mary Doe',
			username: 'marydoe123',
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

		expect(res.status).toBe(200)
		expect(result).toStrictEqual({
			success: true,
			message: 'User updated successfully',
			data: {
				id: '01JHBDWAXFPAKAFK38E1MAM01W',
				name: 'Mary Doe',
				username: 'marydoe123',
				email: 'marydoe@example.com',
				isActive: true,
				isDeleted: false,
				createdAt: date
			}
		})
	})
})
