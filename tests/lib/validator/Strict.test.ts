import { validator } from '@src/lib/validator'
import { describe, expect, test } from 'vitest'

describe('Validator Library', () => {
	test('should reject additional properties when strict is enabled', () => {
		const schema = validator.schema(
			{
				data: validator.boolean()
			},
			{
				strict: true
			}
		)

		const validData = { data: true }
		const validResult = schema.check(validData)

		const invalidData = { data: true, invalidField: 123 }
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'unknownPropertiesDetected',
			field: ['invalidField']
		})
	})

	test('should fail if check empty object', () => {
		const schema = validator.schema(
			{
				data: validator.boolean().nullable()
			},
			{
				strict: true
			}
		)

		const validData = { data: true }
		const validResult = schema.check(validData)

		const invalidData = {}
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'AtLeastOneFieldRequired'
		})
	})
})
