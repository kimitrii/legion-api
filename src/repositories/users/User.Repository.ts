import { users } from '@src/db/user.schema'
import { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { FindByParams } from '@src/types/userRepository'
import { type SQL, eq, or } from 'drizzle-orm'
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
		let filter: SQL<unknown> | undefined = undefined

		if (id && email && username) {
			filter = or(
				eq(users.id, id),
				eq(users.email, email),
				eq(users.username, username)
			)
		} else if (id) {
			filter = eq(users.id, id)
		} else if (email) {
			filter = eq(users.email, email)
		} else if (username) {
			filter = eq(users.username, username)
		}

		const getUser = await this.db.select().from(users).where(filter).limit(1)

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
}
