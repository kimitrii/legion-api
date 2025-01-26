import { Totp } from '@src/lib/totp'
import { describe, expect, test } from 'vitest'

describe('Time based one tap password Library Failure', () => {
	test('should fail with wrong name format', () => {
		const totp = new Totp()

		const secret = totp.generateSecret({
			user: 'Legion API',
			algorithm: 'SHA1',
			service: 'MyApp'
		})

		expect(secret).toStrictEqual({
			error: 'Invalid user.'
		})
	})

	test('should fail with wrong service format', () => {
		const totp = new Totp()

		const secret = totp.generateSecret({
			user: 'LegionAPI',
			algorithm: 'SHA1',
			service: 'My App'
		})

		expect(secret).toStrictEqual({
			error: 'Invalid service.'
		})
	})

	test('should fail with invalid secret base32', () => {
		const totp = new Totp()

		const secret = totp.check({
			secret: 'Invalid Secret',
			algorithm: 'sha1',
			token: '456789'
		})

		expect(secret).toStrictEqual({
			isValid: false,
			error: 'Invalid Base32 secret.'
		})
	})

	test('should fail with invalid token', () => {
		const totp = new Totp()

		const secret = totp.generateSecret({
			user: 'Mary',
			algorithm: 'SHA1',
			service: 'MyApp'
		})

		const isValid = totp.check({
			algorithm: 'sha1',
			secret: secret.secret ?? '',
			token: 'Invalid token'
		})

		expect(isValid).toStrictEqual({
			isValid: false,
			error: 'Invalid token.'
		})
	})
})
