import type { IIdDTO } from '@src/dtos/Id.DTO'
import type { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { UserRepository } from '@src/repositories/users/User.Repository'
import { idSchema } from '@src/validations/id/Id.Validation'

export class GetUserByIdService {
	public constructor(private readonly userRepository: UserRepository) {}

	public async execute(data: IIdDTO): Promise<User> {
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

		if (user[0].deletedAt && !user[0].restoredAt) {
			throw new AppError({
				name: 'Not Found',
				message: 'User has been deleted!',
				cause: {
					id: data.id
				}
			})
		}

		return this.sanitizeUser(user[0])
	}

	private sanitizeUser(user: User): User {
		user.password = undefined
		user.deletedAt = user.deletedAt === null ? undefined : user.deletedAt
		user.restoredAt = user.restoredAt === null ? undefined : user.restoredAt

		return user
	}

	private validation(data: IIdDTO): void {
		const isValidData = idSchema.check(data)

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
