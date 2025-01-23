import type { IAuthPasswordDTO, IAuthReturnDTO } from '@src/dtos/Auth.DTO'
import type { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { UserRepository } from '@src/repositories/users/User.Repository'
import type { Secrets } from '@src/types/envVariables'
import { authSchema } from '@src/validations/users/Auth.Validation'
import bcrypt from 'bcryptjs'
import { sign } from 'hono/jwt'

export class UserAuthService {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly env: Secrets
	) {}

	public async execute(data: IAuthPasswordDTO): Promise<IAuthReturnDTO> {
		this.validation(data)

		const queryUser = await this.userRepository.findOneByOr({
			email: data.email,
			username: data.username,
			andNot: {}
		})
		const user = this.validateUserStatus(queryUser)

		await this.validatePassword(data.password, user.password)

		const token = await this.generateToken(user)

		return {
			id: user.id,
			name: user.name,
			username: user.username,
			email: user.email ? user.email : undefined,
			token: {
				accessToken: token.accessToken,
				refreshToken: token.refreshToken,
				expiresIn: token.accessTokenExp
			}
		}
	}

	private async validatePassword(
		inputPassword: string,
		storedPassword?: string | null
	): Promise<void> {
		if (!storedPassword) {
			throw new AppError({
				name: 'Unprocessable Entity',
				message: 'Unable to complete authentication.'
			})
		}

		const isValid = await bcrypt.compare(inputPassword, storedPassword)

		if (!isValid) {
			throw new AppError({
				name: 'Unauthorized',
				message: 'Access Denied!'
			})
		}
	}

	private validateUserStatus(user: User | null): User {
		if (!user) {
			throw new AppError({
				name: 'Not Found',
				message: 'User not founded!'
			})
		}

		if (user.deletedAt && !user.restoredAt) {
			throw new AppError({
				name: 'Not Found',
				message: 'User has been deleted!'
			})
		}

		if (!user.isActive) {
			throw new AppError({
				name: 'Not Found',
				message: 'User is inactive!'
			})
		}

		return user
	}

	private async generateToken(user: User): Promise<{
		accessToken: string
		refreshToken: string
		accessTokenExp: number
	}> {
		const payloadAccessToken = {
			id: user.id,
			name: user.name,
			username: user.username,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60
		}

		const payloadRefreshToken = {
			id: user.id,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
		}

		if (!this.env.USER_SECRET_KEY || !this.env.REFRESH_SECRET_KEY) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'JWT secrets are not properly configured.'
			})
		}

		const accessToken = await sign(payloadAccessToken, this.env.USER_SECRET_KEY)
		const refreshToken = await sign(
			payloadRefreshToken,
			this.env.REFRESH_SECRET_KEY
		)

		return { accessToken, refreshToken, accessTokenExp: payloadAccessToken.exp }
	}

	private validation(data: IAuthPasswordDTO): void {
		if (!data.email && !data.username) {
			throw new AppError({
				name: 'Bad Request',
				message: 'Either email or username must be provided.'
			})
		}

		const isValidData = authSchema.check(data)

		if (!isValidData.success) {
			throw new AppError({
				name: 'Bad Request',
				message: 'Validation failed',
				cause: {
					field: isValidData.field,
					cause: `is not ${isValidData.failedValidator}`
				}
			})
		}
	}
}
