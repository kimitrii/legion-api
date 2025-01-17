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
	createdAt: text().notNull(),
	deletedAt: text({ length: 24 }),
	restoredAt: text({ length: 24 })
})
