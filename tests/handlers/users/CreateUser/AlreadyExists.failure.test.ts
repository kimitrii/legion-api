import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import type { IUsersDTO } from '@src/dtos/User.DTO'
import app from '@src/index'
import { UserRepository } from '@src/repositories/users/User.Repository'
import { CreateUserService } from '@src/services/users/CreateUser/CreateUser.Service'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test, vitest } from 'vitest'

describe('Create User failure tests', () => {
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

	test('should fail when user with id already exists - unity', async () => {
		const usersRepository = new UserRepository(env.DB)
		const createUserService = new CreateUserService(usersRepository)

		vitest.spyOn(usersRepository, 'findOneByOr').mockResolvedValueOnce({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com',
			isTotpEnable: false,
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: new Date().toISOString()
		})

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

		const payload = {
			name: 'John Doe',
			username: 'johndoe1234',
			isTotpEnable: false
		} as IUsersDTO

		await expect(createUserService.execute(payload)).rejects.toThrowError(
			'This user already exists'
		)
	})

	test('should fail when user with username already exists - E2E', async () => {
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com',
			isTotpEnable: false,
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: new Date().toISOString()
		})

		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe123',
			password: 'secureP@ssw0rd!',
			isTotpEnable: false
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

		expect(res.status).toBe(409)
		expect(result).toStrictEqual({
			success: false,
			message: 'This user already exists',
			cause: {
				username: 'johndoe123'
			}
		})
	})

	test('should fail when user with email already exists - E2E', async () => {
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			isTotpEnable: false,
			password: 'secureP@ssw0rd!',
			email: 'johndoe@example.com',
			isActive: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: new Date().toISOString()
		})

		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe1234',
			email: 'johndoe@example.com',
			isTotpEnable: false
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

		expect(res.status).toBe(409)
		expect(result).toStrictEqual({
			success: false,
			message: 'This user already exists',
			cause: {
				email: 'johndoe@example.com'
			}
		})
	})
})
