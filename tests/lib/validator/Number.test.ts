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
			failedValidator: 'number',
			field: 'data'
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
			failedValidator: 'min',
			field: 'data'
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
			failedValidator: 'max',
			field: 'data'
		})
	})

	test('validates nullable number', () => {
		const schema = validator.schema({
			data: validator.number().nullable()
		})

		const validData = { data: 5 }
		const validResult = schema.check(validData)

		const nullData = {}
		const nullResult = schema.check(nullData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(nullResult).toStrictEqual({
			success: true
		})
	})

	test('should fail with NaN data', () => {
		const schema = validator.schema({
			data: validator.number()
		})

		const validData = { data: 3 }
		const validResult = schema.check(validData)

		const nullData = {}
		const nullResult = schema.check(nullData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(nullResult).toStrictEqual({
			success: false,
			failedValidator: 'nullable',
			field: 'data'
		})
	})
})
