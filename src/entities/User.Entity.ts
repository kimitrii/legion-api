import { ulid } from 'ulid'
import type { Otp } from './Otp.Entity'
import type { RefreshToken } from './RefreshToken.Entity'

export class User {
	public readonly id!: string
	public name!: string
	public username!: string
	public password?: string | null
	public email?: string | null
	public kats?: number | null
	public rank?: number | null
	public isTotpEnable!: boolean
	public otps?: Otp[]
	public refreshToken?: RefreshToken[]
	public isActive!: boolean
	public createdAt!: string
	public deletedAt?: string | null
	public restoredAt?: string | null

	public constructor(props: Omit<User, 'id'>) {
		Object.assign(this, props)

		if (this.id == null) {
			this.id = ulid()
		}

		if (!this.createdAt) {
			this.createdAt = new Date().toISOString()
		}
	}
}
