import { Totp } from '@src/lib/totp'
import { describe, expect, test } from 'vitest'

describe('Time based one tap password Library Failure', () => {
	test('should fail with wrong name format', () => {
		const totp = new Totp()

		const secret = totp.generateSecret({ name: 'Legion API' })

		expect(secret).toStrictEqual({
			error: 'Invalid name.'
		})
	})

	test('should fail with invalid secret base32', () => {
		const totp = new Totp()

		const secret = totp.check('Invalid Secret', '123545')

		expect(secret).toStrictEqual({
			isValid: false,
			error: 'Invalid Base32 secret.'
		})
	})

	test('should fail with invalid token', () => {
		const totp = new Totp()

		const secret = totp.generateSecret({ name: 'LegionAPI' })

		const isValid = totp.check(secret.secret ?? '', 'invalid token')

		expect(isValid).toStrictEqual({
			isValid: false,
			error: 'Invalid token.'
		})
	})
})
