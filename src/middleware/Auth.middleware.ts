import { AppError } from '@src/errors/AppErrors.Error'
import { factory } from '@src/utils/factory'
import { decode, verify } from 'hono/jwt'

export const authenticateToken = factory.createMiddleware(async (c, next) => {
	const authHeader = c.req.header('authorization')

	if (!authHeader) {
		throw new AppError({
			name: 'Unauthorized',
			message: 'Authorization token is missing.'
		})
	}

	const token = authHeader.split(' ')[1]

	const { payload } = decode(token)

	if (payload.iss !== c.env.AUTH_ISSUER) {
		throw new AppError({
			name: 'Unauthorized',
			message: 'Access denied!'
		})
	}

	await verify(token, c.env.USER_SECRET_KEY)

	await next()
})
