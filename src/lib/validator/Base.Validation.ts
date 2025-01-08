import type { ValidationResult, ValidatorFunction } from './validation'

export class ValidationBase {
	private validators: ValidatorFunction[] = []
	private nullableFlag = false

	public nullable(): this {
		this.nullableFlag = true
		return this
	}

	public check(value: unknown): ValidationResult {
		if (value === null || value === undefined) {
			if (this.nullableFlag) {
				return { success: true }
			}
			return { success: false, failedValidator: 'nullable' }
		}
		for (const fn of this.validators) {
			const result = fn(value)
			if (!result.success) {
				return { success: false, failedValidator: result.failedValidator }
			}
		}

		return { success: true }
	}

	protected addValidator(fn: ValidatorFunction): void {
		this.validators.push(fn)
	}
}
