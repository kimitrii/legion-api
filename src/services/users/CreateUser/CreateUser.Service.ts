import type { IUsersDTO } from '@src/dtos/User.DTO'
import { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { UserRepository } from '@src/repositories/users/User.Repository'
import { createUserSchema } from '@src/validations/users/CreateUser.Validation'
import bcrypt from 'bcryptjs'

export class CreateUserService {
	public constructor(private readonly userRepository: UserRepository) {}

	public async execute(data: IUsersDTO): Promise<User> {
		this.validation(data)

		const user = new User(data)

		await this.checkForConflict(user)

		if (user.password) {
			const encryptedPassword = await bcrypt.hash(user.password, 10)
			user.password = encryptedPassword
		}

		const createdUser = await this.userRepository.create(user)

		return this.sanitizeUser(createdUser)
	}

	private sanitizeUser(user: User): User {
		user.password = undefined
		user.kats = undefined
		user.rank = undefined
		user.email = user.email === null ? undefined : user.email

		return user
	}

	private async checkForConflict(user: User): Promise<void> {
		const existingUser = await this.userRepository.findOneByOr({
			id: user.id,
			email: user.email,
			username: user.username
		})

		if (existingUser && existingUser.length !== 0) {
			let conflictField: 'username' | 'email' | 'id'

			if (existingUser[0].username === user.username) {
				conflictField = 'username'
			} else if (existingUser[0].email === user.email) {
				conflictField = 'email'
			} else {
				conflictField = 'id'
			}

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
		const isValidData = createUserSchema.check(data)

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
