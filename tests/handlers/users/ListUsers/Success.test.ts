import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('List Users handler E2E', () => {
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

	test('should retrieved users list successfully', async () => {
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

		await db.insert(users).values({
			id: '01JJ0SF7NJGX8THM5J59WY845C',
			name: 'Mary Doe',
			username: 'marydoe123',
			password: 'secureP@ssw0rd!',
			email: 'marydoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		const res = await app.request(
			'/users?page=1',
			{
				method: 'GET',
				headers
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(200)
		expect(result).toStrictEqual({
			success: true,
			message: 'Users list retrieved successfully',
			data: {
				users: [
					{
						id: '01JHBDWAXFPAKAFK38E1MAM01W',
						name: 'John Doe',
						username: 'johndoe123',
						email: 'johndoe@example.com',
						kats: 0,
						rank: 0,
						isActive: true,
						createdAt: date
					},
					{
						id: '01JJ0SF7NJGX8THM5J59WY845C',
						name: 'Mary Doe',
						username: 'marydoe123',
						email: 'marydoe@example.com',
						kats: 0,
						rank: 0,
						isActive: true,
						createdAt: date
					}
				],
				pagination: {
					isLastPage: true,
					totalItems: 2,
					totalPages: 1
				}
			}
		})
	})

	test('should retrieved including soft deleted users list successfully ', async () => {
		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com',
			isActive: true,
			deletedAt: date,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		await db.insert(users).values({
			id: '01JJ0SF7NJGX8THM5J59WY845C',
			name: 'Mary Doe',
			username: 'marydoe123',
			password: 'secureP@ssw0rd!',
			email: 'marydoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		const res = await app.request(
			'/users?page=1&includeDeleted=true',
			{
				method: 'GET',
				headers
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(200)
		expect(result).toStrictEqual({
			success: true,
			message: 'Users list retrieved successfully',
			data: {
				users: [
					{
						id: '01JHBDWAXFPAKAFK38E1MAM01W',
						name: 'John Doe',
						username: 'johndoe123',
						email: 'johndoe@example.com',
						kats: 0,
						rank: 0,
						deletedAt: date,
						isActive: true,
						createdAt: date
					},
					{
						id: '01JJ0SF7NJGX8THM5J59WY845C',
						name: 'Mary Doe',
						username: 'marydoe123',
						email: 'marydoe@example.com',
						kats: 0,
						rank: 0,
						isActive: true,
						createdAt: date
					}
				],
				pagination: {
					isLastPage: true,
					totalItems: 2,
					totalPages: 1
				}
			}
		})
	})

	test('should retrieved a empty users list page successfully ', async () => {
		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com',
			isActive: true,
			deletedAt: date,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		await db.insert(users).values({
			id: '01JJ0SF7NJGX8THM5J59WY845C',
			name: 'Mary Doe',
			username: 'marydoe123',
			password: 'secureP@ssw0rd!',
			email: 'marydoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		const res = await app.request(
			'/users?page=2&includeDeleted=true',
			{
				method: 'GET',
				headers
			},
			env
		)

		const result = await res.json()

		expect(res.status).toBe(200)
		expect(result).toStrictEqual({
			success: true,
			message: 'Users list retrieved successfully',
			data: {
				users: [],
				pagination: {
					isLastPage: true,
					totalItems: 2,
					totalPages: 1
				}
			}
		})
	})
})
