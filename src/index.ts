import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1';
import { Env } from './types/drizzleTypes';
import { users } from './db/schema';

const app = new Hono<{ Bindings: Env}>()

app.get('/', async (c) => {
  const db = drizzle(c.env.DB)

  await db.insert(users).values({
    name: 'Eric',
  })

  const dbUsers = await db.select().from(users)

  return c.json(dbUsers[0])
})

export default app
