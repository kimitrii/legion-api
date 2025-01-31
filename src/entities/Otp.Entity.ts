import { ulid } from 'ulid'

export class Otp {
	public readonly id!: string
	public otpHash!: string
	public userId!: string
	public createdAt!: string

	public constructor(props: Omit<Otp, 'id'>) {
		Object.assign(this, props)

		if (this.id == null) {
			this.id = ulid()
		}

		if (!this.createdAt) {
			this.createdAt = new Date().toISOString()
		}
	}
}
