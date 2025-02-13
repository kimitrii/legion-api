import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './user.schema'

export const refreshToken = sqliteTable('refreshToken', {
	id: text().notNull(),
	userId: text('user_id').notNull(),
	token: text({ length: 600 }).notNull(),
	userAgent: text({ length: 256 }).notNull(),
	expiresAt: text({ length: 24 }).notNull(),
	revoked: integer({ mode: 'boolean' }).notNull().default(false),
	createdAt: text().notNull()
})

export const refreshTokenRelations = relations(refreshToken, ({ one }) => ({
	user: one(users, {
		fields: [refreshToken.userId],
		references: [users.id]
	})
}))
