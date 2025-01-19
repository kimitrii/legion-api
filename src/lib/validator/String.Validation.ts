import { ValidationBase } from './Base.Validation'

export class StringValidation extends ValidationBase {
	public constructor() {
		super()
		this.addValidator((value) => {
			return { success: typeof value === 'string', failedValidator: 'string' }
		})
	}

	public min(limit: number): this {
		this.addValidator((value) => {
			return { success: value.length >= limit, failedValidator: 'min' }
		})
		return this
	}

	public max(limit: number): this {
		this.addValidator((value) => {
			return { success: value.length <= limit, failedValidator: 'max' }
		})
		return this
	}

	public email(): this {
		this.addValidator((value) => {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

			return {
				success: emailRegex.test(value),
				failedValidator: 'email'
			}
		})
		return this
	}

	public ulid(): this {
		this.addValidator((value) => {
			const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i

			return {
				success: ulidRegex.test(value),
				failedValidator: 'ulid'
			}
		})
		return this
	}

	public url(): this {
		this.addValidator((value) => {
			const urlRegex =
				/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z0-9]{2,6}(\/[^\s]*)?$/i

			return {
				success: urlRegex.test(value),
				failedValidator: 'url'
			}
		})
		return this
	}

	public uuid(): this {
		this.addValidator((value) => {
			const uuidRegex =
				/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

			return {
				success: uuidRegex.test(value),
				failedValidator: 'uuid'
			}
		})
		return this
	}

	public dateTime(): this {
		this.addValidator((value) => {
			const isValidDate = new Date(value)

			if (Number.isNaN(isValidDate.getTime())) {
				return {
					success: false,
					failedValidator: 'dateTime'
				}
			}
			return { success: true }
		})
		return this
	}

	public date(format: 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'MM-DD-YYYY'): this {
		let day: string
		let month: string
		let year: string

		this.addValidator((value: string) => {
			const date = value.split('-')

			switch (format) {
				case 'YYYY-MM-DD':
					day = date[2]
					month = date[1]
					year = date[0]
					break
				case 'DD-MM-YYYY':
					day = date[0]
					month = date[1]
					year = date[2]
					break
				case 'MM-DD-YYYY':
					day = date[1]
					month = date[0]
					year = date[2]
					break
			}

			const isValidDate = new Date(`${year}-${month}-${day}`)

			if (Number.isNaN(isValidDate.getTime())) {
				return {
					success: false,
					failedValidator: 'date'
				}
			}

			return {
				success: true
			}
		})
		return this
	}

	public equals(equals: string): this {
		this.addValidator((value: string) => {
			if (value !== equals) {
				return {
					success: false,
					failedValidator: 'equals'
				}
			}

			return {
				success: true
			}
		})
		return this
	}
}
