import { ValidationBase } from './Base.Validation'

export class BooleanValidation extends ValidationBase {
	public constructor() {
		super()
		this.addValidator((value) => {
			return { success: typeof value === 'boolean', failedValidator: 'boolean' }
		})
	}
}
