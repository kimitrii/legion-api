import { otps } from '@src/db/otp.schema'
import { users } from '@src/db/user.schema'
import type { IOtpDTO } from '@src/dtos/Otp.DTO'
import type {} from '@src/dtos/Pagination.DTO'
import type { Otp } from '@src/entities/Otp.Entity'
import type { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import { desc, eq } from 'drizzle-orm'
import { type DrizzleD1Database, drizzle } from 'drizzle-orm/d1'

export class OtpRepository {
	private db: DrizzleD1Database<Record<string, never>> & {
		$client: D1Database
	}

	public constructor(D1: D1Database) {
		this.db = drizzle(D1)
	}

	public async findByUser(data: { id: string }): Promise<
		(User & { otps: Otp[] }) | null
	> {
		const process = await this.db
			.select()
			.from(users)
			.innerJoin(otps, eq(users.id, otps.userId))
			.where(eq(otps.userId, data.id))
			.orderBy(desc(otps.createdAt))

		if (process.length === 0) {
			return null
		}

		const opts = process.map((row) => {
			return row.otps
		})

		const user: User & { otps: Otp[] } = { otps: opts, ...process[0].users }

		return user
	}

	public async create(data: IOtpDTO): Promise<Otp> {
		const process = await this.db.insert(otps).values({
			id: data.id,
			otpHash: data.otpHash,
			userId: data.userId,
			createdAt: data.createdAt
		})

		if (process.error) {
			throw new AppError({
				name: 'Internal Server Error',
				message: process.error
			})
		}

		const totp = await this.db
			.select()
			.from(otps)
			.where(eq(otps.id, data.id))
			.limit(1)

		if (totp.length === 0) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'User not found after update. Possible data inconsistency.'
			})
		}

		return totp[0]
	}
}
