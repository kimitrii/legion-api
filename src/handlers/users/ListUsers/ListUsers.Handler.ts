import type { IListDTO, IListResultDTO } from '@src/dtos/List.DTO'
import type { User } from '@src/entities/User.Entity'
import { UserRepository } from '@src/repositories/users/User.Repository'
import { ListUsersService } from '@src/services/users/ListUsers/ListUsers.Service'
import type { Presenter } from '@src/types/presenter'
import { factory } from '@src/utils/factory'
import type { TypedResponse } from 'hono'
import { logger } from 'hono/logger'
import type { StatusCode } from 'hono/utils/http-status'

export const ListUsersHandler = factory.createHandlers(
	logger(),
	async (
		c
	): Promise<TypedResponse<Presenter<IListResultDTO<User>>, StatusCode>> => {
		const usersRepository = new UserRepository(c.env.DB)
		const listUsersService = new ListUsersService(usersRepository)

		const page = Number.parseInt(c.req.query('page') ?? '')

		const includeDeleted = c.req.query('includeDeleted')

		const data: IListDTO = { page, includeDeleted }

		const users = await listUsersService.execute(data)

		return c.json(
			{
				success: true,
				message: 'Users list retrieved successfully',
				data: users
			},
			200
		)
	}
)
