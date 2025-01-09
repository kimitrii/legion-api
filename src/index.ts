import { Hono } from 'hono'
import { errorsHandler } from './handlers/error/Errors.Handler'
import usersRouters from './routers/users.router'

const app = new Hono()

app.route('/', usersRouters)

app.onError(errorsHandler)

app.notFound((c) => {
	return c.json(
		{
			success: false,
			message: 'Router not founded!'
		},
		404
	)
})

export default app
