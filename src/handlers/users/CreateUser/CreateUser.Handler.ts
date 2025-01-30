import type { ISanitizedUserDTO } from '@src/dtos/User.DTO'
import { AppError } from '@src/errors/AppErrors.Error'
import { OtpRepository } from '@src/repositories/auth/Otp.DTO'
import { UserRepository } from '@src/repositories/users/User.Repository'
import { CreateUserService } from '@src/services/users/CreateUser/CreateUser.Service'
import type { Presenter } from '@src/types/presenter'
import { factory } from '@src/utils/factory'
import type { TypedResponse } from 'hono'
import { logger } from 'hono/logger'
import type { StatusCode } from 'hono/utils/http-status'

export const CreateUserHandler = factory.createHandlers(
	logger(),
	async (
		c
	): Promise<TypedResponse<Presenter<ISanitizedUserDTO>, StatusCode>> => {
		const usersRepository = new UserRepository(c.env.DB)
		const otpsRepository = new OtpRepository(c.env.DB)
		const createUserService = new CreateUserService(
			usersRepository,
			otpsRepository,
			c.env.OTP_SECRET
		)

		const data = await c.req.json().catch(() => {
			throw new AppError({
				name: 'Bad Request',
				message: 'Invalid JSON format in request body'
			})
		})

		const user = await createUserService.execute(data)

		return c.json(
			{
				success: true,
				message: 'User created successfully',
				data: user
			},
			201
		)
	}
)
