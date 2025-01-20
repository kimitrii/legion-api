import { ValidationBase } from './Base.Validation'

export class NumberValidation extends ValidationBase {
	public constructor() {
		super()
		this.addValidator((value) => {
			return {
				success: !Number.isNaN(value) && typeof value === 'number',
				failedValidator: 'number'
			}
		})
	}

	public min(limit: number): this {
		this.addValidator((value) => {
			const result = value >= limit
			return { success: result, failedValidator: 'min' }
		})
		return this
	}

	public max(limit: number): this {
		this.addValidator((value) => {
			const result = (value as number) <= limit
			return { success: result, failedValidator: 'max' }
		})
		return this
	}
}
