import { validator } from '@src/lib/validator'
import { describe, expect, test } from 'vitest'

describe('Validator Library', () => {
	test('validates object schema', () => {
		const schema = validator.schema({
			data: validator.object({
				id: validator.string().ulid()
			})
		})

		const validData = {
			data: {
				id: '01JFG43AE1T0A77NAT9BR6RA9B'
			}
		}
		const validResult = schema.check(validData)

		const invalidData = {
			data: {
				id: '223'
			}
		}
		const invalidResult = schema.check(invalidData)

		expect(validResult).toStrictEqual({
			success: true
		})
		expect(invalidResult).toStrictEqual({
			success: false,
			failedValidator: 'ulid'
		})
	})
})
