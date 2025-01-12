import { users } from '@src/db/user.schema'
import { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { FindByParams } from '@src/types/userRepository'
import { eq, or } from 'drizzle-orm'
import { type DrizzleD1Database, drizzle } from 'drizzle-orm/d1'

export class UserRepository {
	private db: DrizzleD1Database<Record<string, never>> & {
		$client: D1Database
	}

	public constructor(D1: D1Database) {
		this.db = drizzle(D1)
	}

	public async findOneByOr({
		id,
		email,
		username
	}: FindByParams): Promise<User[] | null> {
		const conditions = []

		if (id) {
			conditions.push(eq(users.id, id))
		}
		if (email) {
			conditions.push(eq(users.email, email))
		}
		if (username) {
			conditions.push(eq(users.username, username))
		}

		if (conditions.length === 0) {
			return null
		}

		const getUser = await this.db
			.select()
			.from(users)
			.where(or(...conditions))
			.limit(1)

		if (getUser.length === 0) {
			return null
		}

		const user = getUser.map((item) => {
			return new User(item)
		})

		return user
	}

	public async create(data: User): Promise<User> {
		const createdUser = await this.db.insert(users).values(data)

		if (createdUser.error) {
			throw new AppError({
				name: 'Internal Server Error',
				message: createdUser.error
			})
		}

		return data
	}

	public async delete(id: string): Promise<void> {
		await this.db
			.update(users)
			.set({
				isDeleted: true
			})
			.where(eq(users.id, id))
	}
}
