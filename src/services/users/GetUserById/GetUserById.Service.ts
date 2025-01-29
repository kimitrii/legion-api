import type { IGetUserDTO } from '@src/dtos/GetUser.DTO'
import type { ISanitizedUserDTO } from '@src/dtos/User.DTO'
import type { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { UserRepository } from '@src/repositories/users/User.Repository'
import { getUserByIdSchema } from '@src/validations/users/GetUserById.Validation'

export class GetUserByIdService {
	public constructor(private readonly userRepository: UserRepository) {}

	public async execute(data: IGetUserDTO): Promise<ISanitizedUserDTO> {
		this.validation(data)

		const user = await this.userRepository.findOneByOr({ id: data.id })

		if (!user) {
			throw new AppError({
				name: 'Not Found',
				message: 'User not founded!',
				cause: {
					id: data.id
				}
			})
		}

		if (user.deletedAt && !user.restoredAt && !data.includeDeleted) {
			throw new AppError({
				name: 'Not Found',
				message: 'User has been deleted!',
				cause: {
					id: data.id
				}
			})
		}

		return this.sanitizeUser(user)
	}

	private sanitizeUser(user: User): ISanitizedUserDTO {
		const { password, isTotpEnable, ...sanitizeUser } = user

		sanitizeUser.deletedAt =
			user.deletedAt === null ? undefined : user.deletedAt
		sanitizeUser.restoredAt =
			user.restoredAt === null ? undefined : user.restoredAt

		return sanitizeUser
	}

	private validation(data: IGetUserDTO): void {
		const isValidData = getUserByIdSchema.check(data)

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
