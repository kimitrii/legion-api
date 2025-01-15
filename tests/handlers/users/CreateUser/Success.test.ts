import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Create User handler E2E', () => {
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

	test('should create user successfully with username, password and email', async () => {
		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com'
		})

		const res = await app.request(
			'/users',
			{
				method: 'POST',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, 'johndoe@example.com'))
			.limit(1)

		expect(res.status).toBe(201)
		expect(result).toStrictEqual({
			success: true,
			message: 'User created successfully',
			data: {
				id: user.id,
				name: 'John Doe',
				username: 'johndoe123',
				email: 'johndoe@example.com',
				isActive: true,
				isDeleted: false,
				createdAt: user.createdAt
			}
		})
	})

	test('should create user successfully with username', async () => {
		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe123'
		})

		const res = await app.request(
			'/users',
			{
				method: 'POST',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.username, 'johndoe123'))
			.limit(1)

		expect(res.status).toBe(201)
		expect(result).toStrictEqual({
			success: true,
			message: 'User created successfully',
			data: {
				id: user.id,
				name: 'John Doe',
				username: 'johndoe123',
				isActive: true,
				isDeleted: false,
				createdAt: user.createdAt
			}
		})
	})

	test('should create user successfully with username and email', async () => {
		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe123',
			email: 'johndoe@example.com'
		})

		const res = await app.request(
			'/users',
			{
				method: 'POST',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, 'johndoe@example.com'))
			.limit(1)

		expect(res.status).toBe(201)
		expect(result).toStrictEqual({
			success: true,
			message: 'User created successfully',
			data: {
				id: user.id,
				name: 'John Doe',
				username: 'johndoe123',
				email: 'johndoe@example.com',
				isActive: true,
				isDeleted: false,
				createdAt: user.createdAt
			}
		})
	})

	test('should create user successfully with username and password', async () => {
		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!'
		})

		const res = await app.request(
			'/users',
			{
				method: 'POST',
				headers,
				body: payload
			},
			env
		)

		const result = await res.json()

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.username, 'johndoe123'))
			.limit(1)

		expect(res.status).toBe(201)
		expect(result).toStrictEqual({
			success: true,
			message: 'User created successfully',
			data: {
				id: user.id,
				name: 'John Doe',
				username: 'johndoe123',
				isActive: true,
				isDeleted: false,
				createdAt: user.createdAt
			}
		})
	})
})
