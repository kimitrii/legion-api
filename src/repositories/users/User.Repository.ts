import { users } from '@src/db/user.schema'
import type {
	IPaginationParamsDTO,
	PaginatedResult
} from '@src/dtos/Pagination.DTO'
import type { IFindByParamsDTO } from '@src/dtos/Repositories.DTO'
import type { IUsersDTO } from '@src/dtos/User.DTO'
import { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import { and, count, eq, isNull, not, or } from 'drizzle-orm'
import { type DrizzleD1Database, drizzle } from 'drizzle-orm/d1'

export class UserRepository {
	private db: DrizzleD1Database<Record<string, never>> & {
		$client: D1Database
	}

	public constructor(D1: D1Database) {
		this.db = drizzle(D1)
	}

	public async findAll(
		data: IPaginationParamsDTO
	): Promise<PaginatedResult<User>> {
		const offset = (data.page - 1) * data.limit

		let userQuery = this.db
			.select()
			.from(users)
			.limit(data.limit)
			.offset(offset)
			.where(isNull(users.deletedAt))

		if (data.includeDeleted) {
			userQuery = this.db.select().from(users).limit(data.limit).offset(offset)
		}

		let countQuery = this.db
			.select({ count: count() })
			.from(users)
			.where(isNull(users.deletedAt))

		if (data.includeDeleted) {
			countQuery = this.db.select({ count: count() }).from(users)
		}

		const userRecords = await userQuery
		const totalUsers = await countQuery

		const usersList = userRecords.map((item) => {
			return new User(item)
		})

		return { items: usersList, totalItems: totalUsers[0].count }
	}

	public async findOneByOr({
		id,
		email,
		username,
		andNot
	}: IFindByParamsDTO): Promise<User | null> {
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

		if (includeConditions.length === 0 && excludeConditions.length === 0) {
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

		return user[0]
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
		const updateResult = await this.db
			.update(users)
			.set({
				name: data.name,
				username: data.username,
				email: data.email,
				isTotpEnable: data.isTotpEnable
			})
			.where(eq(users.id, data.id))

		if (updateResult.error) {
			throw new AppError({
				name: 'Internal Server Error',
				message: updateResult.error
			})
		}

		const queriedUser = await this.db
			.select()
			.from(users)
			.where(eq(users.id, data.id))
			.limit(1)

		if (queriedUser.length === 0) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'User not found after update. Possible data inconsistency.'
			})
		}

		const updatedUser = new User(queriedUser[0])

		return updatedUser
	}

	public async updatePassword(data: User): Promise<User> {
		const updatePasswordResult = await this.db
			.update(users)
			.set({
				password: data.password
			})
			.where(eq(users.id, data.id))

		if (updatePasswordResult.error) {
			throw new AppError({
				name: 'Internal Server Error',
				message: updatePasswordResult.error
			})
		}

		const queriedUser = await this.db
			.select()
			.from(users)
			.where(eq(users.id, data.id))
			.limit(1)

		if (queriedUser.length === 0) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'User not found after update. Possible data inconsistency.'
			})
		}

		const updatedPassword = new User(queriedUser[0])

		return updatedPassword
	}

	public async delete(id: string): Promise<User> {
		await this.db
			.update(users)
			.set({
				deletedAt: new Date().toISOString(),
				isActive: false
			})
			.where(eq(users.id, id))

		const queriedUser = await this.db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1)

		if (queriedUser.length === 0) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'User not found after update. Possible data inconsistency.'
			})
		}

		const deletedUser = new User(queriedUser[0])

		return deletedUser
	}
}
