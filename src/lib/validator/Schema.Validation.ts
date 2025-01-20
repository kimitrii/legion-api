import type { ValidationBase } from './Base.Validation'
import type { ValidationResult } from './validation'

export class SchemaValidation<T extends Record<string, unknown>> {
	private schema: Record<keyof T, ValidationBase>
	private strict

	public constructor(
		schema: Record<keyof T, ValidationBase>,
		options?: {
			strict: boolean
		}
	) {
		this.schema = schema
		this.strict = options?.strict
	}

	public check(data: Partial<T>): ValidationResult {
		if (this.strict) {
			const keys = Object.keys(data)
			const extraKeys = keys.filter((key) => !(key in this.schema))

			if (extraKeys.length > 0) {
				return {
					success: false,
					failedValidator: 'unknownPropertiesDetected',
					field: extraKeys
				}
			}

			if (keys.length === 0) {
				return {
					success: false,
					failedValidator: 'AtLeastOneFieldRequired'
				}
			}
		}

		for (const [key, validator] of Object.entries(this.schema)) {
			const result = validator.check(data[key])

			if (!result.success) {
				return {
					success: false,
					failedValidator: result.failedValidator,
					field: key
				}
			}
		}

		return { success: true }
	}
}
