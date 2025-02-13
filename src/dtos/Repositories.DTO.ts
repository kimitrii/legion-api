import type { IUsersDTO } from '@src/dtos/User.DTO'

export type IFindByParamsDTO = {
	id?: string
	email?: string | null
	username?: string | null
	revoked?: boolean
	noExpired?: boolean
	andNot?: Partial<Record<keyof IUsersDTO, string>>
} & (
	| { id: string }
	| { email: string }
	| { username: string }
	| { andNot: Partial<Record<keyof IUsersDTO, string>> }
)
