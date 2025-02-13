import type {
	IAuthPasswordDTO,
	IAuthReturnDTO,
	StoreRefreshTokenInput
} from '@src/dtos/Auth.DTO'
import { RefreshToken } from '@src/entities/RefreshToken.Entity'
import type { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { WebCryptoAES } from '@src/lib/webCryptoAES'
import type { RefreshTokenRepository } from '@src/repositories/auth/RefreshToken.Repository'
import type { UserRepository } from '@src/repositories/users/User.Repository'
import { authSchema } from '@src/validations/auth/Auth.Validation'
import bcrypt from 'bcryptjs'
import type { JWTManager } from '../jwtManager/JWTManager.Service'

export class UserAuthService {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtManager: JWTManager,
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly webCryptoAES: WebCryptoAES
	) {}

	public async execute(data: IAuthPasswordDTO): Promise<IAuthReturnDTO> {
		this.validation(data)

		const queryUser = await this.userRepository.findOneByOr({
			email: data.email,
			username: data.username,
			andNot: {}
		})
		const user = this.validateUserStatus(queryUser)

		await this.validatePassword(data.password, user.password)
		await this.reHashingPassword(data.password, user)

		const token = await this.jwtManager.generateToken({
			id: user.id,
			name: user.name,
			username: user.username
		})

		const hashedToken = await this.hashRefreshToken(token.refreshToken)

		await this.storeRefreshToken({
			expiresAt: token.refreshTokenExp,
			refreshToken: hashedToken,
			userAgent: data.userAgent,
			userId: user.id
		})

		return {
			id: user.id,
			name: user.name,
			username: user.username,
			email: user.email ? user.email : undefined,
			token: {
				accessToken: token.accessToken,
				refreshToken: token.refreshToken,
				expiresIn: token.accessTokenExp
			}
		}
	}

	private async hashRefreshToken(refreshToken: string): Promise<string> {
		const encryptedClientToken =
			await this.webCryptoAES.encryptSymetric(refreshToken)

		if (!encryptedClientToken.cipherText || encryptedClientToken.error) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'Internal Server Error'
			})
		}

		return encryptedClientToken.cipherText
	}

	private async storeRefreshToken(data: StoreRefreshTokenInput): Promise<void> {
		const refreshTokenData = {
			revoked: false,
			token: data.refreshToken,
			userAgent: data.userAgent,
			userId: data.userId,
			expiresAt: new Date(data.expiresAt * 1000).toISOString()
		}
		const refreshToken = new RefreshToken(refreshTokenData)

		await this.refreshTokenRepository.create(refreshToken)
	}

	private async reHashingPassword(password: string, user: User): Promise<void> {
		const encryptedPassword = await bcrypt.hash(password, 10)

		user.password = encryptedPassword

		await this.userRepository.updatePassword(user)
	}

	private async validatePassword(
		inputPassword: string,
		storedPassword?: string | null
	): Promise<void> {
		if (!storedPassword) {
			throw new AppError({
				name: 'Unprocessable Entity',
				message: 'Unable to complete authentication.'
			})
		}

		const isValid = await bcrypt.compare(inputPassword, storedPassword)

		if (!isValid) {
			throw new AppError({
				name: 'Unauthorized',
				message: 'Access Denied!'
			})
		}
	}

	private validateUserStatus(user: User | null): User {
		if (!user) {
			throw new AppError({
				name: 'Not Found',
				message: 'User not founded!'
			})
		}

		if (user.deletedAt && !user.restoredAt) {
			throw new AppError({
				name: 'Not Found',
				message: 'User has been deleted!'
			})
		}

		if (!user.isActive) {
			throw new AppError({
				name: 'Not Found',
				message: 'User is inactive!'
			})
		}

		return user
	}

	private validation(data: IAuthPasswordDTO): void {
		if (!data.email && !data.username) {
			throw new AppError({
				name: 'Bad Request',
				message: 'Either email or username must be provided.'
			})
		}

		const isValidData = authSchema.check(data)

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
