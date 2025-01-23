import { UserAuthHandler } from '@src/handlers/auth/users/UserAuth.Handler'
import { Hono } from 'hono'

const authRouters = new Hono()

authRouters.post('/users/login', ...UserAuthHandler)

export default authRouters
