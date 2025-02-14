import type { ISanitizedAuthDTO } from '@src/dtos/Auth.DTO'
import { WebCryptoAES } from '@src/lib/webCryptoAES'
import { RefreshTokenRepository } from '@src/repositories/auth/RefreshToken.Repository'
import { JWTManager } from '@src/services/auth/jwtManager/JWTManager.Service'
import { RefreshTokenService } from '@src/services/auth/refreshToken/RefreshToken.Service'
import type { Presenter } from '@src/types/presenter'
import { factory } from '@src/utils/factory'
import type { TypedResponse } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { logger } from 'hono/logger'
import type { StatusCode } from 'hono/utils/http-status'

export const RefreshTokenHandler = factory.createHandlers(
	logger(),
	async (
		c
	): Promise<TypedResponse<Presenter<ISanitizedAuthDTO>, StatusCode>> => {
		const refreshTokenRepository = new RefreshTokenRepository(c.env.DB)
		const jwtManager = new JWTManager({
			USER_SECRET_KEY: c.env.USER_SECRET_KEY,
			REFRESH_SECRET_KEY: c.env.REFRESH_SECRET_KEY,
			AUTH_ISSUER: c.env.AUTH_ISSUER
		})
		const webCryptoAES = new WebCryptoAES({
			secret: c.env.REFRESH_AES_KEY
		})
		const refreshTokenService = new RefreshTokenService(
			refreshTokenRepository,
			c.env.AUTH_ISSUER,
			c.env.USER_SECRET_KEY,
			c.env.REFRESH_SECRET_KEY,
			jwtManager,
			webCryptoAES
		)

		const authorization = c.req.header('authorization') ?? ''
		const accessToken = authorization.split(' ')[1]

		const userAgent = c.req.header('User-Agent') ?? ''

		const refreshToken = getCookie(c, 'refreshToken') ?? ''

		const data = { refreshToken, userAgent, accessToken }

		const user = await refreshTokenService.execute(data)

		setCookie(c, 'refreshToken', user.token.refreshToken, {
			secure: true,
			httpOnly: true,
			sameSite: 'Strict',
			maxAge: 60 * 60 * 24 * 27,
			path: '/users/auth/refresh'
		})

		return c.json(
			{
				success: true,
				message: 'Token refreshed successfully',
				data: {
					id: user.id,
					name: user.name,
					username: user.username,
					email: user.email ? user.email : undefined,
					token: {
						accessToken: user.token.accessToken,
						expiresIn: user.token.expiresIn
					}
				}
			},
			200
		)
	}
)
