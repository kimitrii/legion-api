import { sql } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { ulid } from 'ulid'

export const users = sqliteTable('users', {
	id: text().$defaultFn(() => ulid()),
	name: text({ length: 255 }).notNull(),
	createdAt: text().default(sql`CURRENT_TIMESTAMP`).notNull()
})
