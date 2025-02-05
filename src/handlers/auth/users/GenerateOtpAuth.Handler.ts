import { OtpRepository } from '@src/repositories/auth/Otp.Repository'
import { UserRepository } from '@src/repositories/users/User.Repository'
import { GenerateOtpAuthUrlService } from '@src/services/auth/otp/GenerateOtpAuthUrl.Service'
import { SetupUserOtpService } from '@src/services/auth/otp/SetupUserOTP.Service'
import type { Presenter } from '@src/types/presenter'
import { factory } from '@src/utils/factory'
import type { TypedResponse } from 'hono'
import { logger } from 'hono/logger'
import type { StatusCode } from 'hono/utils/http-status'

export const GenerateOtpAuthUrlHandler = factory.createHandlers(
	logger(),
	async (
		c
	): Promise<TypedResponse<Presenter<{ otpauthUrl: string }>, StatusCode>> => {
		const usersRepository = new UserRepository(c.env.DB)
		const otpRepository = new OtpRepository(c.env.DB)
		const setupUserOtp = new SetupUserOtpService(
			otpRepository,
			c.env.OTP_SECRET
		)
		const generateOtpAuthUrlService = new GenerateOtpAuthUrlService(
			usersRepository,
			setupUserOtp,
			otpRepository
		)

		const id = c.req.param('id')

		const otpUrl = await generateOtpAuthUrlService.execute({ id })

		return c.json(
			{
				success: true,
				message: 'Otp url generated successfully',
				data: otpUrl
			},
			200
		)
	}
)
