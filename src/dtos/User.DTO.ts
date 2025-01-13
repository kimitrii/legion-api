export interface IUsersDTO {
	id: string
	name: string
	username: string
	password?: string | null
	email?: string | null
	kats?: number | null
	rank?: number | null
	isActive: boolean
	isDeleted: boolean
	createdAt: string
}
