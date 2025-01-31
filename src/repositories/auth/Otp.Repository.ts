import { otps } from '@src/db/otp.schema'
import type {} from '@src/dtos/Pagination.DTO'
import { Otp } from '@src/entities/Otp.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import { eq } from 'drizzle-orm'
import { type DrizzleD1Database, drizzle } from 'drizzle-orm/d1'

export class OtpRepository {
	private db: DrizzleD1Database<Record<string, never>> & {
		$client: D1Database
	}

	public constructor(D1: D1Database) {
		this.db = drizzle(D1)
	}

	public async create(data: Otp): Promise<Otp> {
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

		const createdUser = new Otp(totp[0])

		return createdUser
	}
}
