import { ValidationBase } from './Base.Validation'
import type { ValidationResult } from './validation'

export class ObjectValidation extends ValidationBase {
	private schema: Record<string, ValidationBase> = {}

	public constructor(schema: Record<string, ValidationBase> = {}) {
		super()
		this.schema = schema
	}

	public addProperty(key: string, validator: ValidationBase): this {
		this.schema[key] = validator
		return this
	}

	public check(value: unknown): ValidationResult {
		if (typeof value !== 'object' || value === null) {
			return { success: false, failedValidator: 'object' }
		}

		for (const [key, validator] of Object.entries(this.schema)) {
			const result = validator.check((value as Record<string, unknown>)[key])

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
