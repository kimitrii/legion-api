import type { IUsersDTO } from '@src/dtos/User.DTO'

export type FindByParams = {
	id?: string
	email?: string | null
	username?: string | null
	andNot?: Partial<Record<keyof IUsersDTO, string>>
} & (
	| { id: string }
	| { email: string }
	| { username: string }
	| { andNot: Partial<Record<keyof IUsersDTO, string>> }
)
