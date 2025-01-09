import type { ValidationBase } from './Base.Validation'
import type { ValidationResult } from './validation'

export class SchemaValidation<T extends Record<string, unknown>> {
	private schema: Record<keyof T, ValidationBase>

	public constructor(schema: Record<keyof T, ValidationBase>) {
		this.schema = schema
	}

	public check(data: Partial<T>): ValidationResult {
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
