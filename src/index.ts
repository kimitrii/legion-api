import { Hono } from 'hono'
import usersRouters from './routers/users.router'
import type { Env } from './types/bindTypes'

const app = new Hono<{ Bindings: Env }>()

app.route('/', usersRouters)

export default app
