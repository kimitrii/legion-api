import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { otps } from './otp.schema'
import { refreshToken } from './refreshToken.schema'

export const users = sqliteTable('users', {
	id: text().notNull(),
	name: text({ length: 256 }).notNull(),
	username: text({ length: 256 }).notNull(),
	password: text({ length: 256 }),
	email: text({ length: 256 }),
	kats: integer().default(0),
	rank: integer(),
	isTotpEnable: integer({ mode: 'boolean' }).notNull().default(false),
	isActive: integer({ mode: 'boolean' }).notNull().default(true),
	createdAt: text().notNull(),
	deletedAt: text({ length: 24 }),
	restoredAt: text({ length: 24 })
})

export const usersRelations = relations(users, ({ many }) => ({
	otps: many(otps),
	refreshToken: many(refreshToken)
}))
