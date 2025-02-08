import type { ISanitizedAuthDTO } from '@src/dtos/Auth.DTO'
import { AppError } from '@src/errors/AppErrors.Error'
import { UserRepository } from '@src/repositories/users/User.Repository'
import { JWTManager } from '@src/services/auth/jwtManager/JWTManager.Service'
import { UserAuthService } from '@src/services/auth/userAuth/UserAuth.Service'
import type { Presenter } from '@src/types/presenter'
import { factory } from '@src/utils/factory'
import type { TypedResponse } from 'hono'
import { setCookie } from 'hono/cookie'
import { logger } from 'hono/logger'
import type { StatusCode } from 'hono/utils/http-status'

export const UserAuthHandler = factory.createHandlers(
	logger(),
	async (
		c
	): Promise<
		TypedResponse<Presenter<Partial<ISanitizedAuthDTO>>, StatusCode>
	> => {
		const usersRepository = new UserRepository(c.env.DB)
		const jwtManager = new JWTManager({
			USER_SECRET_KEY: c.env.USER_SECRET_KEY,
			REFRESH_SECRET_KEY: c.env.REFRESH_SECRET_KEY,
			AUTH_ISSUER: c.env.AUTH_ISSUER
		})
		const userAuthService = new UserAuthService(usersRepository, jwtManager)

		const data = await c.req.json().catch(() => {
			throw new AppError({
				name: 'Bad Request',
				message: 'Invalid JSON format in request body'
			})
		})

		const user = await userAuthService.execute(data)

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
				message: 'User authenticated successfully',
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
