import type { ISanitizedUserDTO, IUsersDTO } from '@src/dtos/User.DTO'
import { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { UserRepository } from '@src/repositories/users/User.Repository'
import type { SetupUserOtpService } from '@src/services/auth/otp/SetupUserOTP.Service'
import { createUserSchema } from '@src/validations/users/CreateUser.Validation'
import bcrypt from 'bcryptjs'

export class CreateUserService {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly setupUserOTP: SetupUserOtpService
	) {}

	public async execute(data: IUsersDTO): Promise<ISanitizedUserDTO> {
		this.validation(data)

		const user = new User(data)

		await this.checkForConflict(user)

		if (user.password) {
			const encryptedPassword = await bcrypt.hash(user.password, 10)
			user.password = encryptedPassword
		}

		user.isTotpEnable = false

		const createdUser = await this.userRepository.create(user)
		const otpauth = await this.setupUserOTP.excecute(
			createdUser,
			data.isTotpEnable
		)

		return this.sanitizeUser(createdUser, otpauth.otpAuthUrl)
	}

	private sanitizeUser(user: User, otpauth?: string): ISanitizedUserDTO {
		const { password, isTotpEnable, kats, rank, ...sanitizeUser } = user

		sanitizeUser.email = user.email === null ? undefined : user.email
		sanitizeUser.deletedAt =
			user.deletedAt === null ? undefined : user.deletedAt
		sanitizeUser.restoredAt =
			user.restoredAt === null ? undefined : user.restoredAt

		return { ...sanitizeUser, otpauth }
	}

	private async checkForConflict(user: User): Promise<void> {
		const existingUser = await this.userRepository.findOneByOr({
			id: user.id,
			email: user.email,
			username: user.username
		})

		if (existingUser) {
			let conflictField: 'username' | 'email' | 'id'

			if (existingUser.username === user.username) {
				conflictField = 'username'
			} else if (existingUser.email === user.email) {
				conflictField = 'email'
			} else {
				conflictField = 'id'
			}

			throw new AppError({
				name: 'Conflict',
				message: 'This user already exists',
				cause: {
					[conflictField]: existingUser[conflictField]
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
