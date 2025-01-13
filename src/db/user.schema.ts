import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
	id: text().notNull(),
	name: text({ length: 256 }).notNull(),
	username: text({ length: 256 }).notNull(),
	password: text({ length: 256 }),
	email: text({ length: 256 }),
	kats: integer().default(0),
	rank: integer(),
	isActive: integer({ mode: 'boolean' }).notNull().default(true),
	isDeleted: integer({ mode: 'boolean' }).notNull().default(false),
	createdAt: text().default(sql`CURRENT_TIMESTAMP`).notNull()
})
