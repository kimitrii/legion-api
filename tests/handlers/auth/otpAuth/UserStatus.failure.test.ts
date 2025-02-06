import { applyD1Migrations, env } from 'cloudflare:test'
import { otps } from '@src/db/otp.schema'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('User OTP authentication Status E2E', () => {
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
			username: 'johnDoe',
			token: '123456'
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

		expect(res.status).toBe(404)
		expect(result).toStrictEqual({
			success: false,
			message: 'User not founded!'
		})
	})

	test('should fail when user has been deleted', async () => {
		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			email: 'johndoe@example.com',
			isTotpEnable: true,
			isActive: true,
			deletedAt: date,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		await db.insert(otps).values({
			id: '01JK4JKV50GPZ8R32DP399WGRQ',
			otpHash: '01JK4JKV50GPZ8R32DP399WGRQ01JK4JKV50GPZ8R32DP399WGRQ',
			userId: '01JHBDWAXFPAKAFK38E1MAM01W',
			createdAt: date
		})

		const payload = JSON.stringify({
			username: 'johndoe123',
			token: '1234569'
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

		expect(res.status).toBe(404)
		expect(result).toStrictEqual({
			success: false,
			message: 'User has been deleted!'
		})
	})

	test('should fail when user is inactive', async () => {
		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			email: 'johndoe@example.com',
			isActive: false,
			isTotpEnable: true,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		await db.insert(otps).values({
			id: '01JK4JKV50GPZ8R32DP399WGRQ',
			otpHash: '01JK4JKV50GPZ8R32DP399WGRQ01JK4JKV50GPZ8R32DP399WGRQ',
			userId: '01JHBDWAXFPAKAFK38E1MAM01W',
			createdAt: date
		})

		const payload = JSON.stringify({
			username: 'johndoe123',
			token: '123456'
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

		expect(res.status).toBe(404)
		expect(result).toStrictEqual({
			success: false,
			message: 'User is inactive!'
		})
	})

	test('should fail when isTotpEnable is inactive', async () => {
		const date = new Date().toISOString()
		await db.insert(users).values({
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			email: 'johndoe@example.com',
			isActive: false,
			isTotpEnable: false,
			deletedAt: null,
			kats: 0,
			rank: 0,
			createdAt: date
		})

		await db.insert(otps).values({
			id: '01JK4JKV50GPZ8R32DP399WGRQ',
			otpHash: '01JK4JKV50GPZ8R32DP399WGRQ01JK4JKV50GPZ8R32DP399WGRQ',
			userId: '01JHBDWAXFPAKAFK38E1MAM01W',
			createdAt: date
		})

		const payload = JSON.stringify({
			username: 'johndoe123',
			token: '123456'
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

		expect(res.status).toBe(403)
		expect(result).toStrictEqual({
			success: false,
			message: 'OTP is not enabled'
		})
	})
})
