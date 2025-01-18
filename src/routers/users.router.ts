import { CreateUserHandler } from '@src/handlers/users/CreateUser/CreateUser.Handler'
import { DeleteUserHandler } from '@src/handlers/users/DeleteUser/DeleteUser.Handler'
import { GetUserByIdHandler } from '@src/handlers/users/GetUserById/GetUserById.Handler'
import { UpdateUserHandler } from '@src/handlers/users/UpdateUser/UpdateUser.Handler'
import { Hono } from 'hono'

const usersRouters = new Hono()

usersRouters.get('/users/:id', ...GetUserByIdHandler)
usersRouters.post('/users', ...CreateUserHandler)
usersRouters.put('/users/:id', ...UpdateUserHandler)
usersRouters.delete('/users/:id', ...DeleteUserHandler)

export default usersRouters
