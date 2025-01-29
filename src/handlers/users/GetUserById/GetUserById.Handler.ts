import type { IGetUserDTO } from '@src/dtos/GetUser.DTO'
import type { ISanitizedUserDTO } from '@src/dtos/User.DTO'
import { UserRepository } from '@src/repositories/users/User.Repository'
import { GetUserByIdService } from '@src/services/users/GetUserById/GetUserById.Service'
import type { Presenter } from '@src/types/presenter'
import { factory } from '@src/utils/factory'
import type { TypedResponse } from 'hono'
import { logger } from 'hono/logger'
import type { StatusCode } from 'hono/utils/http-status'

export const GetUserByIdHandler = factory.createHandlers(
	logger(),
	async (
		c
	): Promise<TypedResponse<Presenter<ISanitizedUserDTO>, StatusCode>> => {
		const usersRepository = new UserRepository(c.env.DB)
		const getUserByIdService = new GetUserByIdService(usersRepository)

		const id = c.req.param('id')

		const queryParameters = c.req.query('includeDeleted')

		const data: IGetUserDTO = { id, includeDeleted: queryParameters }

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
