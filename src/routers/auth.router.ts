import { EnableOtpHandler } from '@src/handlers/auth/users/EnableOTP.Handler'
import { UserAuthHandler } from '@src/handlers/auth/users/UserAuth.Handler'
import { Hono } from 'hono'

const authRouters = new Hono()

authRouters.post('/users/login', ...UserAuthHandler)
authRouters.put('/users/:id/otp', ...EnableOtpHandler)

export default authRouters
