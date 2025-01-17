import { users } from '@src/db/user.schema'
import type { IUsersDTO } from '@src/dtos/User.DTO'
import { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { FindByParams } from '@src/types/userRepository'
import { and, eq, not, or } from 'drizzle-orm'
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
		username,
		andNot
	}: FindByParams): Promise<User[] | null> {
		const includeConditions = []
		const excludeConditions = []

		if (id) {
			includeConditions.push(eq(users.id, id))
		}
		if (email) {
			includeConditions.push(eq(users.email, email))
		}
		if (username) {
			includeConditions.push(eq(users.username, username))
		}
		if (andNot) {
			for (const [key, value] of Object.entries(andNot)) {
				excludeConditions.push(not(eq(users[key as keyof IUsersDTO], value)))
			}
		}

		if (includeConditions.length === 0) {
			return null
		}

		const process = await this.db
			.select()
			.from(users)
			.where(and(or(...includeConditions), ...excludeConditions))
			.limit(1)

		if (process.length === 0) {
			return null
		}

		const user = process.map((item) => {
			return new User(item)
		})

		return user
	}

	public async create(data: User): Promise<User> {
		const process = await this.db.insert(users).values(data)

		if (process.error) {
			throw new AppError({
				name: 'Internal Server Error',
				message: process.error
			})
		}

		const user = await this.db
			.select()
			.from(users)
			.where(eq(users.id, data.id))
			.limit(1)

		if (user.length === 0) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'User not found after update. Possible data inconsistency.'
			})
		}

		const createdUser = new User(user[0])

		return createdUser
	}

	public async update(data: User): Promise<User> {
		const process = await this.db
			.update(users)
			.set({
				name: data.name,
				username: data.username,
				email: data.email
			})
			.where(eq(users.id, data.id))

		if (process.error) {
			throw new AppError({
				name: 'Internal Server Error',
				message: process.error
			})
		}

		const user = await this.db
			.select()
			.from(users)
			.where(eq(users.id, data.id))
			.limit(1)

		if (user.length === 0) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'User not found after update. Possible data inconsistency.'
			})
		}

		const updatedUser = new User(user[0])

		return updatedUser
	}

	public async delete(id: string): Promise<User> {
		await this.db
			.update(users)
			.set({
				deletedAt: new Date().toISOString(),
				isActive: false
			})
			.where(eq(users.id, id))

		const user = await this.db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1)

		if (user.length === 0) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'User not found after update. Possible data inconsistency.'
			})
		}

		const deletedUser = new User(user[0])

		return deletedUser
	}
}
