import { AppError } from '@src/errors/AppErrors.Error'
import { OtpRepository } from '@src/repositories/auth/Otp.Repository'
import { UserRepository } from '@src/repositories/users/User.Repository'
import { EnableOTPService } from '@src/services/auth/otp/EnableOTP.Service'
import type { Presenter } from '@src/types/presenter'
import { factory } from '@src/utils/factory'
import type { TypedResponse } from 'hono'
import { logger } from 'hono/logger'
import type { StatusCode } from 'hono/utils/http-status'

export const EnableOtpHandler = factory.createHandlers(
	logger(),
	async (c): Promise<TypedResponse<Presenter<undefined>, StatusCode>> => {
		const usersRepository = new UserRepository(c.env.DB)
		const otpRepository = new OtpRepository(c.env.DB)
		const userAuthService = new EnableOTPService(
			otpRepository,
			usersRepository,
			c.env.OTP_SECRET
		)

		const id = c.req.param('id')

		const token = await c.req.json().catch(() => {
			throw new AppError({
				name: 'Bad Request',
				message: 'Invalid JSON format in request body'
			})
		})

		const data = { userId: id, ...token }

		await userAuthService.execute(data)

		return c.json(
			{
				success: true,
				message: 'User OTP enable successfully',
				data: undefined
			},
			200
		)
	}
)
