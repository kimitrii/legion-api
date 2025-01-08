type ValidationResult =
	| { success: true }
	| { success: false; failedValidator: string }

export type ValidatorFunction = (value: T) => ValidationResult
