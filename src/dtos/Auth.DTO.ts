export type IAuthPasswordDTO = {
	email?: string
	password: string
	username?: string
	userAgent: string
} & ({ email: string } | { username: string })

export type IAuthOtpDTO = {
	email?: string
	token: string
	username?: string
	userAgent: string
} & ({ email: string } | { username: string })

export interface IAuthReturnDTO {
	id: string
	name: string
	username: string
	email?: string
	token: {
		accessToken: string
		refreshToken: string
		expiresIn: number
	}
}

export type ISanitizedAuthDTO = Omit<IAuthReturnDTO, 'token'> & {
	token: Omit<IAuthReturnDTO['token'], 'refreshToken'>
}

export interface StoreRefreshTokenInput {
	refreshToken: string
	userAgent: string
	userId: string
	expiresAt: number
}
