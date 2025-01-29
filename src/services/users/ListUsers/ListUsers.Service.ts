import type { IListDTO, IListResultDTO } from '@src/dtos/List.DTO'
import type { ISanitizedUserDTO } from '@src/dtos/User.DTO'
import type { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { UserRepository } from '@src/repositories/users/User.Repository'
import { listUsersSchema } from '@src/validations/users/ListUsers.Validation'

export class ListUsersService {
	public constructor(private readonly userRepository: UserRepository) {}

	public async execute(
		data: IListDTO
	): Promise<IListResultDTO<ISanitizedUserDTO>> {
		this.validation(data)

		const users = await this.userRepository.findAll({
			limit: 20,
			page: data.page,
			includeDeleted: data.includeDeleted ? true : undefined
		})

		if (users.totalItems === 0) {
			throw new AppError({
				name: 'Not Found',
				message: 'No users found!'
			})
		}

		const totalPages = Math.ceil(users.totalItems / 20)

		return {
			users: this.sanitizeUser(users.items),
			pagination: {
				totalPages,
				totalItems: users.totalItems,
				isLastPage: data.page >= totalPages
			}
		}
	}

	private sanitizeUser(users: User[]): ISanitizedUserDTO[] {
		const sanitizedUsers = users.map((user) => {
			const { password, isTotpEnable, ...sanitizeUser } = user

			sanitizeUser.deletedAt =
				user.deletedAt === null ? undefined : user.deletedAt
			sanitizeUser.restoredAt =
				user.restoredAt === null ? undefined : user.restoredAt
			return sanitizeUser
		})

		return sanitizedUsers
	}

	private validation(data: IListDTO): void {
		const isValidData = listUsersSchema.check(data)

		if (!isValidData.success) {
			throw new AppError({
				name: 'Bad Request',
				message: 'Validation failed',
				cause: {
					field: isValidData.field,
					cause: `is not ${isValidData.failedValidator}`
				}
			})
		}
	}
}
