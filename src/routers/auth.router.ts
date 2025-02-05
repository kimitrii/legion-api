import { EnableOtpHandler } from '@src/handlers/auth/users/EnableOTP.Handler'
import { GenerateOtpAuthUrlHandler } from '@src/handlers/auth/users/GenerateOtpAuth.Handler'
import { UserAuthHandler } from '@src/handlers/auth/users/UserAuth.Handler'
import { authenticateToken } from '@src/middleware/Auth.middleware'
import { Hono } from 'hono'

const authRouters = new Hono()

authRouters.post('/users/login', ...UserAuthHandler)
authRouters.put('/users/:id/otp', ...EnableOtpHandler)
authRouters.post(
	'/users/:id/otp/secret',
	authenticateToken,
	...GenerateOtpAuthUrlHandler
)

export default authRouters
