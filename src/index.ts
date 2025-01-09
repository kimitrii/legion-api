import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { secureHeaders } from 'hono/secure-headers'
import { errorsHandler } from './handlers/error/Errors.Handler'
import usersRouters from './routers/users.router'

const app = new Hono()

app.use(csrf({ origin: process.env.LEGION_WEBSITE }))

app.use(secureHeaders())

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
