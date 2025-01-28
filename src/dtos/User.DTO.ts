export interface IUsersDTO {
	id: string
	name: string
	username: string
	password?: string | null
	email?: string | null
	kats?: number | null
	rank?: number | null
	isTotpEnable: boolean
	isActive: boolean
	createdAt: string
	deletedAt?: string | null
	restoredAt?: string | null
}
