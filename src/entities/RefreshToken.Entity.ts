import { ulid } from 'ulid'

export class RefreshToken {
	public readonly id!: string
	public userId!: string
	public token!: string
	public userAgent!: string
	public expiresAt!: string
	public revoked!: boolean
	public createdAt!: string

	public constructor(props: Omit<RefreshToken, 'id' | 'createdAt'>) {
		Object.assign(this, props)

		if (this.id == null) {
			this.id = ulid()
		}

		if (!this.createdAt) {
			this.createdAt = new Date().toISOString()
		}
	}
}
