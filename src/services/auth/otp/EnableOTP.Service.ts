import type { IOtpDTO, IOtpParamsDTO } from '@src/dtos/Otp.DTO'
import type { IUsersDTO } from '@src/dtos/User.DTO'
import type { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import { Totp } from '@src/lib/totp'
import { WebCryptoAES } from '@src/lib/webCryptoAES'
import type { OtpRepository } from '@src/repositories/auth/Otp.Repository'
import type { UserRepository } from '@src/repositories/users/User.Repository'
import { enableOTPSchema } from '@src/validations/users/EnableOTP.Validation'

export class EnableOTPService {
	public constructor(
		private readonly otpRepository: OtpRepository,
		private readonly userRepository: UserRepository,
		private readonly otpSecret: string
	) {}

	public async execute(data: IOtpParamsDTO): Promise<void> {
		this.validationInput(data)

		const user = await this.getUserWithOTP(data.userId)

		this.checkIfAlreadyEnable(user)

		const decryptedSecret = await this.decryptOTPSecret(user.otps[0].otpHash)

		this.verifyOTP(decryptedSecret, data.token)

		await this.enableUserOTP(user)
	}

	private async getUserWithOTP(
		userId: string
	): Promise<User & { otps: IOtpDTO[] }> {
		const user = await this.otpRepository.findManyByOr({ id: userId })

		if (!user || !user.otps?.length) {
			throw new AppError({
				name: 'Not Found',
				message: 'No OTP found'
			})
		}

		return user
	}

	private checkIfAlreadyEnable(user: User): void {
		if (user.isTotpEnable) {
			throw new AppError({
				name: 'Conflict',
				message: 'OTP is already enabled'
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

	private async enableUserOTP(user: IUsersDTO): Promise<void> {
		user.isTotpEnable = true
		await this.userRepository.update(user)
	}

	private validationInput(data: IOtpParamsDTO): asserts data is IOtpParamsDTO {
		const isValidData = enableOTPSchema.check(data)

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
