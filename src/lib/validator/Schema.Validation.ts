import type { ValidationBase } from './Base.Validation'
import type { ValidationResult } from './validation'

export class SchemaValidation {
	private schema: Record<string, ValidationBase>

	public constructor(schema: Record<string, ValidationBase>) {
		this.schema = schema
	}

	public check(data: Record<string, unknown>): ValidationResult {
		for (const [key, validator] of Object.entries(this.schema)) {
			const result = validator.check(data[key])

			if (!result.success) {
				return {
					success: false,
					failedValidator: result.failedValidator
				}
			}
		}

		return { success: true }
	}
}
