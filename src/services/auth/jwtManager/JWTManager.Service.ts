import { sign } from 'hono/jwt'

export class JWTManager {
	private readonly userSecretyKey: string
	private readonly refreshSecretKey: string
	private readonly issuer: string

	public constructor({
		USER_SECRET_KEY,
		REFRESH_SECRET_KEY,
		AUTH_ISSUER
	}: {
		USER_SECRET_KEY: string
		REFRESH_SECRET_KEY: string
		AUTH_ISSUER: string
	}) {
		this.userSecretyKey = USER_SECRET_KEY
		this.refreshSecretKey = REFRESH_SECRET_KEY
		this.issuer = AUTH_ISSUER
	}

	public async generateToken({
		id,
		name,
		username
	}: { id: string; name: string; username: string }): Promise<{
		accessToken: string
		refreshToken: string
		accessTokenExp: number
		refreshTokenExp: number
	}> {
		const payloadAccessToken = {
			sub: id,
			name,
			username,
			iss: this.issuer,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}

		const payloadRefreshToken = {
			sub: id,
			iss: this.issuer,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
		}

		const accessToken = await sign(payloadAccessToken, this.userSecretyKey)
		const refreshToken = await sign(payloadRefreshToken, this.refreshSecretKey)

		return {
			accessToken,
			refreshToken,
			accessTokenExp: payloadAccessToken.exp,
			refreshTokenExp: payloadRefreshToken.exp
		}
	}
}
