import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { users } from '../db/schema'
import type { Env } from '../types/drizzleTypes'

const usersRouters = new Hono<{ Bindings: Env }>()

usersRouters.get('/', async (c) => {
	const db = drizzle(c.env.DB)

	await db.insert(users).values({
		name: 'Eric'
	})

	const dbUsers = await db.select().from(users)

	return c.json(dbUsers[0])
})

export default usersRouters
