type ValidationResult =
	| { success: true }
	| { success: false; failedValidator: string; field?: string }

export type ValidatorFunction = (value: T) => ValidationResult
