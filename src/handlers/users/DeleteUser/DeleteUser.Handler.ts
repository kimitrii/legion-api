import type { ISanitizedUserDTO } from '@src/dtos/User.DTO'
import { UserRepository } from '@src/repositories/users/User.Repository'
import { DeleteUserService } from '@src/services/users/DeleteUser/DeleteUser.Service'
import type { Presenter } from '@src/types/presenter'
import { factory } from '@src/utils/factory'
import type { TypedResponse } from 'hono'
import { logger } from 'hono/logger'
import type { StatusCode } from 'hono/utils/http-status'

export const DeleteUserHandler = factory.createHandlers(
	logger(),
	async (
		c
	): Promise<TypedResponse<Presenter<ISanitizedUserDTO>, StatusCode>> => {
		const usersRepository = new UserRepository(c.env.DB)
		const deleteUserService = new DeleteUserService(usersRepository)

		const id = c.req.param('id')

		const data = { id }

		const user = await deleteUserService.execute(data)

		return c.json(
			{
				success: true,
				message: 'User deleted successfully',
				data: user
			},
			200
		)
	}
)
