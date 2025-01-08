import { validator } from '@src/lib/validator'
import { describe, expect, test } from 'vitest'

describe('Validator Library', () => {
	test('validates array of objects', () => {
		const schema = validator.schema({
			data: validator.arrayOf(
				validator.object({
					id: validator.string().ulid(),
					name: validator.string()
				})
			)
		})

		const validData = {
			data: [
				{
					id: '01JFG43AE1T0A77NAT9BR6RA9B',
					name: 'Eliote'
				}
			]
		}
		const validResult = schema.check(validData)

		const invalidData = {
			data: [
				{
					id: 'invalid id',
					name: 'Eliote'
				}
			]
		}
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'array-item-ulid'
		})
	})
})
