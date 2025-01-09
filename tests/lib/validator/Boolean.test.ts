import { validator } from '@src/lib/validator'
import { describe, expect, test } from 'vitest'

describe('Validator Library', () => {
	test('validates boolean type', () => {
		const schema = validator.schema({
			data: validator.boolean()
		})

		const validData = { data: true }
		const validResult = schema.check(validData)

		const invalidData = { data: 'Invalid data' }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'boolean',
			field: 'data'
		})
	})
})
