import type { User } from '@src/entities/User.Entity'
import { UserRepository } from '@src/repositories/users/User.Repository'
import { GetUserByIdService } from '@src/services/users/GetUserById/GetUserById.Service'
import type { Presenter } from '@src/types/presenter'
import { factory } from '@src/utils/factory'
import type { TypedResponse } from 'hono'
import { logger } from 'hono/logger'
import type { StatusCode } from 'hono/utils/http-status'

export const GetUserByIdHandler = factory.createHandlers(
	logger(),
	async (c): Promise<TypedResponse<Presenter<User>, StatusCode>> => {
		const usersRepository = new UserRepository(c.env.DB)
		const getUserByIdService = new GetUserByIdService(usersRepository)

		const id = c.req.param('id')

		const data = { id }

		const user = await getUserByIdService.execute(data)

		return c.json(
			{
				success: true,
				message: 'User retrieved successfully',
				data: user
			},
			200
		)
	}
)
