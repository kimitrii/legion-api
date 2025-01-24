import { applyD1Migrations, env } from 'cloudflare:test'
import { users } from '@src/db/user.schema'
import app from '@src/index'
import { drizzle } from 'drizzle-orm/d1'
import { sign } from 'hono/jwt'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

describe('Update User Input Validation - E2E', () => {
	const db = drizzle(env.DB)

	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	afterEach(async () => {
		await db.delete(users)
	})

	test('should fail when name is not a string', async () => {
		const payload = JSON.stringify({
			name: 1234,
			username: 'johndoe123',
			email: 'exemple@exemple.com'
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'name',
				cause: 'is not string'
			}
		})
	})

	test('should fail when name exceeds the maximum length of 256 characters', async () => {
		const longName = 'a'.repeat(257)

		const payload = JSON.stringify({
			name: longName,
			username: 'johndoe123'
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'name',
				cause: 'is not max'
			}
		})
	})

	test('should fail when name is shorter than the minimum length of 1 characters', async () => {
		const payload = JSON.stringify({
			name: '',
			username: 'johndoe123'
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'name',
				cause: 'is not min'
			}
		})
	})

	test('should fail when name is undefined', async () => {
		const payload = JSON.stringify({
			name: undefined,
			username: 'johndoe123'
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'name',
				cause: 'is not nullable'
			}
		})
	})

	test('should fail when username is not a string', async () => {
		const payload = JSON.stringify({
			name: 'John Doe',
			username: 1234
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'username',
				cause: 'is not string'
			}
		})
	})

	test('should fail when username exceeds the maximum length of 256 characters', async () => {
		const longName = 'a'.repeat(257)

		const payload = JSON.stringify({
			name: 'John Doe',
			username: longName
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'username',
				cause: 'is not max'
			}
		})
	})

	test('should fail when username is shorter than the minimum length of 1 characters', async () => {
		const payload = JSON.stringify({
			name: 'John Doe',
			username: ''
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'username',
				cause: 'is not min'
			}
		})
	})

	test('should fail when username is undefined', async () => {
		const payload = JSON.stringify({
			name: 'John Doe',
			username: undefined
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'username',
				cause: 'is not nullable'
			}
		})
	})

	test('should fail when email is not a string', async () => {
		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe123',
			email: 1234
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'email',
				cause: 'is not string'
			}
		})
	})

	test('should fail when email exceeds the maximum length of 256 characters', async () => {
		const longPassword = 'a'.repeat(257)

		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe123',
			email: `test@test.com${longPassword}`
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'email',
				cause: 'is not max'
			}
		})
	})

	test('should fail when email is not email format', async () => {
		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe123',
			email: '1234567'
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				field: 'email',
				cause: 'is not email'
			}
		})
	})

	test('should fail when there is a property not defined in the schema', async () => {
		const payload = JSON.stringify({
			name: 'John Doe',
			username: 'johndoe123',
			test: '1234567'
		})

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Validation failed',
			cause: {
				cause: 'is not unknownPropertiesDetected',
				field: ['test']
			}
		})
	})

	test('should throw a Bad Request error when invalid JSON is provided', async () => {
		const payload =
			'{ name: "John Doe", username: "johndoe123", email: asdf@test.com, password: "randomPassword" }'

		const payloadAccessToken = {
			id: '01JHBDWAXFPAKAFK38E1MAM01W',
			name: 'John Doe',
			username: 'johndoe123',
			iss: env.AUTH_ISSUER,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}
		const accessToken = await sign(payloadAccessToken, env.USER_SECRET_KEY)

		const headers = {
			'Content-Type': 'application/json',
			'X-CSRF-Token': 'mock-csrf-token',
			authorization: `Bearer ${accessToken}`
		}

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

		expect(res.status).toBe(400)
		expect(result).toStrictEqual({
			success: false,
			message: 'Invalid JSON format in request body'
		})
	})
})
