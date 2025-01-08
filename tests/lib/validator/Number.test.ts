import { validator } from '@src/lib/validator'
import { describe, expect, test } from 'vitest'

describe('Validator Library', () => {
	test('validates number type', () => {
		const schema = validator.schema({
			data: validator.number()
		})

		const validData = { data: 65 }
		const validResult = schema.check(validData)

		const invalidData = { data: 'Invalid data' }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'number'
		})
	})

	test('validates number with minimum value', () => {
		const schema = validator.schema({
			data: validator.number().min(5)
		})

		const validData = { data: 6 }
		const validResult = schema.check(validData)

		const invalidData = { data: 4 }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'min'
		})
	})

	test('validates number with maximum value', () => {
		const schema = validator.schema({
			data: validator.number().max(5)
		})

		const validData = { data: 5 }
		const validResult = schema.check(validData)

		const invalidData = { data: 6 }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'max'
		})
	})

	test('validates nullable number', () => {
		const schema = validator.schema({
			data: validator.number().nullable()
		})

		const validData = { data: 5 }
		const validResult = schema.check(validData)

		const invalidData = {}
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: true
		})
	})
})
