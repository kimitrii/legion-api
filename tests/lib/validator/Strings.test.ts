import { validator } from '@src/lib/validator'
import { describe, expect, test } from 'vitest'

describe('Validator Library', () => {
	test('validates ULID format', () => {
		const schema = validator.schema({
			data: validator.string().ulid()
		})

		const validData = { data: '01JFG43AE1T0A77NAT9BR6RA9B' }
		const validResult = schema.check(validData)

		const invalidData = { data: 'Invalid' }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'ulid',
			field: 'data'
		})
	})

	test('validates UUID format', () => {
		const schema = validator.schema({
			data: validator.string().uuid()
		})

		const validData = { data: '71635b6d-fdd5-48a2-8b9b-32613f9d240a' }
		const validResult = schema.check(validData)

		const invalidData = { data: '71635b6dfdd548a28b9b32613f9d240a' }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'uuid',
			field: 'data'
		})
	})

	test('validates URL format', () => {
		const schema = validator.schema({
			data: validator.string().url()
		})

		const validData = { data: 'https://kimitri.com' }
		const validResult = schema.check(validData)

		const invalidData = { data: 'htt://www.kimitri' }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'url',
			field: 'data'
		})
	})

	test('validates string type', () => {
		const schema = validator.schema({
			data: validator.string()
		})

		const validData = { data: 'Valid Data' }
		const validResult = schema.check(validData)

		const invalidData = { data: 65 }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'string',
			field: 'data'
		})
	})

	test('validates string with minimum length', () => {
		const schema = validator.schema({
			data: validator.string().min(5)
		})

		const validData = { data: '12345' }
		const validResult = schema.check(validData)

		const invalidData = { data: '1234' }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'min',
			field: 'data'
		})
	})

	test('validates string with maximum length', () => {
		const schema = validator.schema({
			data: validator.string().max(5)
		})

		const validData = { data: '12345' }
		const validResult = schema.check(validData)

		const invalidData = { data: '123456' }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'max',
			field: 'data'
		})
	})

	test('validates email format', () => {
		const schema = validator.schema({
			data: validator.string().email()
		})

		const validData = { data: 'test@test.com' }
		const validResult = schema.check(validData)

		const invalidData = { data: 'invalid-email' }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'email',
			field: 'data'
		})
	})

	test('validates dateTime format', () => {
		const schema = validator.schema({
			data: validator.string().dateTime()
		})

		const validData = { data: '2025-01-07T16:11:03.466Z' }
		const validResult = schema.check(validData)

		const invalidData = { data: '2025-13-50T16:11:03.466Z' }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'dateTime',
			field: 'data'
		})
	})

	test('validates date format DD-MM-YYYY', () => {
		const schema = validator.schema({
			data: validator.string().date('DD-MM-YYYY')
		})

		const validData = { data: '31-04-1990' }
		const validResult = schema.check(validData)

		const invalidData = { data: '33-04-1990' }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'date',
			field: 'data'
		})
	})

	test('validates date format MM-DD-YYYY', () => {
		const schema = validator.schema({
			data: validator.string().date('MM-DD-YYYY')
		})

		const validData = { data: '04-24-1990' }
		const validResult = schema.check(validData)

		const invalidData = { data: '33-04-1990' }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'date',
			field: 'data'
		})
	})

	test('validates date format YYYY-MM-DD', () => {
		const schema = validator.schema({
			data: validator.string().date('YYYY-MM-DD')
		})

		const validData = { data: '2005-01-28' }
		const validResult = schema.check(validData)

		const invalidData = { data: '33-04-1990' }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'date',
			field: 'data'
		})
	})
})
