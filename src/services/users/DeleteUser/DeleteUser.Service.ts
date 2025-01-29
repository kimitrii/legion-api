import type { IIdDTO } from '@src/dtos/Id.DTO'
import type { ISanitizedUserDTO } from '@src/dtos/User.DTO'
import type { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { UserRepository } from '@src/repositories/users/User.Repository'
import { idSchema } from '@src/validations/id/Id.Validation'

export class DeleteUserService {
	public constructor(private readonly userRepository: UserRepository) {}

	public async execute(data: IIdDTO): Promise<ISanitizedUserDTO> {
		this.validation(data)

		await this.isDeleted(data)

		const deletedUser = await this.userRepository.delete(data.id)

		return this.sanitizeUser(deletedUser)
	}

	private sanitizeUser(user: User): ISanitizedUserDTO {
		const { password, restoredAt, isTotpEnable, ...sanitizeUser } = user

		return sanitizeUser
	}

	private async isDeleted(user: IIdDTO): Promise<void> {
		const existingUser = await this.userRepository.findOneByOr({
			id: user.id
		})

		if (!existingUser) {
			throw new AppError({
				name: 'Not Found',
				message: 'User not founded!',
				cause: {
					id: user.id
				}
			})
		}

		if (existingUser.deletedAt && !existingUser.restoredAt) {
			throw new AppError({
				name: 'Not Found',
				message: 'This user has been deleted!',
				cause: {
					id: user.id
				}
			})
		}
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
