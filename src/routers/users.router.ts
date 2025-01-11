import { CreateUserHandler } from '@src/handlers/users/CreateUser/CreateUser.Handler'
import { Hono } from 'hono'

const usersRouters = new Hono()

usersRouters.post('/users', ...CreateUserHandler)

export default usersRouters
