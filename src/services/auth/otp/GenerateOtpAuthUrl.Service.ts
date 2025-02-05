import type { IIdDTO } from '@src/dtos/Id.DTO'
import { AppError } from '@src/errors/AppErrors.Error'
import type { OtpRepository } from '@src/repositories/auth/Otp.Repository'
import type { UserRepository } from '@src/repositories/users/User.Repository'
import { idSchema } from '@src/validations/id/Id.Validation'
import type { SetupUserOtpService } from './SetupUserOTP.Service'

export class GenerateOtpAuthUrlService {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly setupUserOTP: SetupUserOtpService,
		private readonly otpRepository: OtpRepository
	) {}

	public async execute(data: IIdDTO): Promise<{ otpauthUrl: string }> {
		this.validationInput(data)

		const user = await this.userRepository.findOneByOr({ id: data.id })

		if (!user) {
			throw new AppError({
				name: 'Not Found',
				message: 'User not founded!'
			})
		}

		await this.otpRepository.delete(user.id)

		const otp = await this.setupUserOTP.excecute(user, true)

		if (!otp.otpAuthUrl) {
			throw new AppError({
				name: 'Conflict',
				message: 'OTP already enable!'
			})
		}

		return {
			otpauthUrl: otp.otpAuthUrl
		}
	}

	private validationInput(data: IIdDTO): void {
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
