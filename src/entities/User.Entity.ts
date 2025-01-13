import { ulid } from 'ulid'

export class User {
	public readonly id!: string
	public name!: string
	public username!: string
	public password?: string | null
	public email?: string | null
	public kats?: number | null
	public rank?: number | null
	public isActive!: boolean
	public isDeleted!: boolean
	public createdAt!: string

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
