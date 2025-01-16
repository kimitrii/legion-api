import type { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import { UserRepository } from '@src/repositories/users/User.Repository'
import { UpdateUserService } from '@src/services/users/UpdateUser/UpdateUser.Service'
import type { Presenter } from '@src/types/presenter'
import { factory } from '@src/utils/factory'
import type { TypedResponse } from 'hono'
import { logger } from 'hono/logger'
import type { StatusCode } from 'hono/utils/http-status'

export const UpdateUserHandler = factory.createHandlers(
	logger(),
	async (c): Promise<TypedResponse<Presenter<User>, StatusCode>> => {
		const usersRepository = new UserRepository(c.env.DB)
		const updateUserService = new UpdateUserService(usersRepository)

		const id = c.req.param('id')
		const body = await c.req.json().catch(() => {
			throw new AppError({
				name: 'Bad Request',
				message: 'Invalid JSON format in request body'
			})
		})

		const data = { id, ...body }

		const user = await updateUserService.execute(data)

		return c.json(
			{
				success: true,
				message: 'User updated successfully',
				data: user
			},
			200
		)
	}
)
