import { CreateUserHandler } from '@src/handlers/users/CreateUser/CreateUser.Handler'
import { UpdateUserHandler } from '@src/handlers/users/UpdateUser/UpdateUser.Handler'
import { Hono } from 'hono'

const usersRouters = new Hono()

usersRouters.post('/users', ...CreateUserHandler)
usersRouters.put('/users/:id', ...UpdateUserHandler)

export default usersRouters
