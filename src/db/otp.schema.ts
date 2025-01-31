import { relations } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './user.schema'

export const otps = sqliteTable('otps', {
	id: text().notNull(),
	otpHash: text({ length: 256 }).notNull(),
	userId: text('user_id').notNull(),
	createdAt: text().notNull()
})

export const otpsRelations = relations(otps, ({ one }) => ({
	user: one(users, {
		fields: [otps.userId],
		references: [users.id]
	})
}))
