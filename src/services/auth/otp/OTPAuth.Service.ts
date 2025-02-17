import type {
	IAuthOtpDTO,
	IAuthReturnDTO,
	StoreRefreshTokenInput
} from '@src/dtos/Auth.DTO'
import type { IOtpDTO } from '@src/dtos/Otp.DTO'
import { RefreshToken } from '@src/entities/RefreshToken.Entity'
import type { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import { Totp } from '@src/lib/totp'
import { WebCryptoAES } from '@src/lib/webCryptoAES'
import type { OtpRepository } from '@src/repositories/auth/Otp.Repository'
import type { RefreshTokenRepository } from '@src/repositories/auth/RefreshToken.Repository'
import { OTPAuthSchema } from '@src/validations/auth/OTPAuth.Validation'
import type { JWTManager } from '../jwtManager/JWTManager.Service'

export class OTPAuthService {
	public constructor(
		private readonly otpRepository: OtpRepository,
		private readonly jwtManager: JWTManager,
		private readonly otpSecret: string,
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly webCryptoAES: WebCryptoAES
	) {}

	public async execute(data: IAuthOtpDTO): Promise<IAuthReturnDTO> {
		this.validationInput(data)

		const user = await this.getUserWithOTP(data.username, data.email)

		this.validateUserStatus(user)

		const decryptedSecret = await this.decryptOTPSecret(user.otps[0].otpHash)

		this.verifyOTP(decryptedSecret, data.token)

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

	private async getUserWithOTP(
		username?: string,
		email?: string
	): Promise<User & { otps: IOtpDTO[] }> {
		const user = await this.otpRepository.findManyByOr({
			username,
			email,
			andNot: {}
		})

		if (!user || !user.otps?.length) {
			throw new AppError({
				name: 'Not Found',
				message: 'User not founded!'
			})
		}

		return user
	}

	private validateUserStatus(user: User): void {
		if (!user.isTotpEnable) {
			throw new AppError({
				name: 'Forbidden',
				message: 'OTP is not enabled'
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
	}

	private async decryptOTPSecret(otpHash: string): Promise<string> {
		const webCryptoAES = new WebCryptoAES({ secret: this.otpSecret })

		const decrypted = await webCryptoAES.decryptSymetric(otpHash)

		if (decrypted.error || !decrypted.plainText) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'Invalid OTP encryption'
			})
		}

		return decrypted.plainText
	}

	private verifyOTP(secret: string, token: string): void {
		const totp = new Totp()

		const result = totp.check({ secret, algorithm: 'sha256', token })

		if (result.error || !result.isValid) {
			throw new AppError({
				name: 'Unauthorized',
				message: 'Invalid OTP token'
			})
		}
	}

	private validationInput(data: IAuthOtpDTO): void {
		if (!data.email && !data.username) {
			throw new AppError({
				name: 'Bad Request',
				message: 'Either email or username must be provided.'
			})
		}

		const isValidData = OTPAuthSchema.check(data)

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
