import { ValidationBase } from './Base.Validation'
import type { ValidationResult } from './validation'

export class ArrayValidation extends ValidationBase {
	private schema: ValidationBase

	public constructor(schema: ValidationBase) {
		super()
		this.schema = schema
	}

	public check(value: unknown): ValidationResult {
		if (!Array.isArray(value)) {
			return { success: false, failedValidator: 'array' }
		}

		for (const item of value) {
			const result = this.schema.check(item)
			if (!result.success) {
				return {
					success: false,
					failedValidator: `array-item-${result.failedValidator}`
				}
			}
		}

		return { success: true }
	}
}
