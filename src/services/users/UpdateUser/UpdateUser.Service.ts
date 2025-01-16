import type { IUsersDTO } from '@src/dtos/User.DTO'
import { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { UserRepository } from '@src/repositories/users/User.Repository'
import { updateUserSchema } from '@src/validations/users/UpdateUser.Validation'

export class UpdateUserService {
	public constructor(private readonly userRepository: UserRepository) {}

	public async execute(data: IUsersDTO): Promise<User> {
		this.validation(data)

		const user = new User(data)

		await this.ensureUserExists(data.id)

		await this.checkForConflict(user)

		const updatedUser = await this.userRepository.update(user)

		return this.sanitizeUser(updatedUser)
	}

	private sanitizeUser(user: User): User {
		user.password = undefined
		user.kats = undefined
		user.rank = undefined

		return user
	}

	private async ensureUserExists(userId: string): Promise<User> {
		const user = await this.userRepository.findOneByOr({ id: userId })

		if (!user) {
			throw new AppError({
				name: 'Not Found',
				message: 'User not founded!',
				cause: {
					id: userId
				}
			})
		}

		return user[0]
	}

	private async checkForConflict(user: User): Promise<void> {
		const existingUser = await this.userRepository.findOneByOr({
			email: user.email,
			username: user.username,
			andNot: {
				id: user.id
			}
		})

		if (existingUser && existingUser.length !== 0) {
			const conflictField =
				existingUser[0].username === user.username ? 'username' : 'email'

			throw new AppError({
				name: 'Conflict',
				message: 'This user already exists',
				cause: {
					[conflictField]: existingUser[0][conflictField]
				}
			})
		}
	}

	private validation(data: IUsersDTO): void {
		const isValidData = updateUserSchema.check(data)

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
