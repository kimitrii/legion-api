export interface IRefreshTokenDTO {
	id: string
	userId: string
	token: string
	userAgent: string
	expiresAt: string
	revoked: boolean
	createdAt: string
}

export interface IRefreshTokenParamsDTO {
	refreshToken: string
	accessToken: string
	userAgent: string
}
