export type IAuthPasswordDTO = {
	email?: string
	password: string
	username?: string
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
