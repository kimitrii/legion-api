import { refreshToken } from '@src/db/refreshToken.schema'
import { users } from '@src/db/user.schema'
import type {} from '@src/dtos/Pagination.DTO'
import type { IRefreshTokenDTO } from '@src/dtos/RefreshToken.DTO'
import type { IFindByParamsDTO } from '@src/dtos/Repositories.DTO'
import { RefreshToken } from '@src/entities/RefreshToken.Entity'
import type { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import { and, desc, eq, gt } from 'drizzle-orm'
import { type DrizzleD1Database, drizzle } from 'drizzle-orm/d1'

export class RefreshTokenRepository {
	private db: DrizzleD1Database<Record<string, never>> & {
		$client: D1Database
	}

	public constructor(D1: D1Database) {
		this.db = drizzle(D1)
	}

	public async findManyByOr(
		data: IFindByParamsDTO
	): Promise<(User & { refreshToken: RefreshToken[] }) | null> {
		const includeConditions = []

		if (data.id) {
			includeConditions.push(eq(refreshToken.userId, data.id))
		}
		if (data.revoked) {
			includeConditions.push(eq(refreshToken.revoked, data.revoked))
		}
		if (data.noExpired) {
			includeConditions.push(
				gt(refreshToken.expiresAt, new Date().toISOString())
			)
		}

		const process = await this.db
			.select()
			.from(users)
			.innerJoin(refreshToken, eq(users.id, refreshToken.userId))
			.where(and(...includeConditions))
			.orderBy(desc(refreshToken.createdAt))

		if (process.length === 0) {
			return null
		}

		const opts = process.map((row) => {
			return row.refreshToken
		})

		const user: User & { refreshToken: RefreshToken[] } = {
			refreshToken: opts,
			...process[0].users
		}

		return user
	}

	public async create(data: IRefreshTokenDTO): Promise<RefreshToken> {
		const process = await this.db.insert(refreshToken).values(data)

		if (process.error) {
			throw new AppError({
				name: 'Internal Server Error',
				message: process.error
			})
		}

		const token = await this.db
			.select()
			.from(refreshToken)
			.where(eq(refreshToken.id, data.id))
			.limit(1)

		if (token.length === 0) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'Token not found after update. Possible data inconsistency.'
			})
		}

		return token[0]
	}

	public async update(data: RefreshToken): Promise<RefreshToken> {
		const updateResult = await this.db
			.update(refreshToken)
			.set({
				revoked: data.revoked
			})
			.where(eq(refreshToken.id, data.id))

		if (updateResult.error) {
			throw new AppError({
				name: 'Internal Server Error',
				message: updateResult.error
			})
		}

		const queriedRefreshToken = await this.db
			.select()
			.from(refreshToken)
			.where(eq(refreshToken.id, data.id))
			.limit(1)

		if (queriedRefreshToken.length === 0) {
			throw new AppError({
				name: 'Internal Server Error',
				message:
					'Refresh Token not found after update. Possible data inconsistency.'
			})
		}

		const updatedRefreshToken = new RefreshToken(queriedRefreshToken[0])

		return updatedRefreshToken
	}

	public async delete(id: string): Promise<RefreshToken[] | null> {
		const process = await this.db
			.delete(refreshToken)
			.where(eq(refreshToken.userId, id))
			.returning()

		if (process.length === 0) {
			return null
		}

		return process
	}
}
