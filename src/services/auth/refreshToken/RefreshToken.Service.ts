import type { IAuthReturnDTO, StoreRefreshTokenInput } from '@src/dtos/Auth.DTO'
import type {
	IRefreshTokenDTO,
	IRefreshTokenParamsDTO
} from '@src/dtos/RefreshToken.DTO'
import type { IUsersDTO } from '@src/dtos/User.DTO'
import { RefreshToken } from '@src/entities/RefreshToken.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import type { WebCryptoAES } from '@src/lib/webCryptoAES'
import type { RefreshTokenRepository } from '@src/repositories/auth/RefreshToken.Repository'
import { refreshTokenSchema } from '@src/validations/auth/RefreshToken.Validation'
import { decode, verify } from 'hono/jwt'
import type { TokenHeader } from 'hono/utils/jwt/jwt'
import {
	type JWTPayload,
	JwtTokenSignatureMismatched
} from 'hono/utils/jwt/types'
import type { JWTManager } from '../jwtManager/JWTManager.Service'

export class RefreshTokenService {
	public constructor(
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly AUTH_ISSUER: string,
		private readonly USER_SECRET_KEY: string,
		private readonly REFRESH_SECRET_KEY: string,
		private readonly jwtManager: JWTManager,
		private readonly webCryptoAES: WebCryptoAES
	) {}

	public async execute(data: IRefreshTokenParamsDTO): Promise<IAuthReturnDTO> {
		this.validationInput(data)

		await this.verifySignature(data.accessToken, 'accessToken')
		await this.verifySignature(data.refreshToken, 'refreshToken')

		const { refreshToken, accessToken } = this.decodeTokens(data)

		this.validateToken(refreshToken)
		this.validateToken(accessToken)

		this.checkTokensSubMatch(accessToken.payload.sub, refreshToken.payload.sub)

		this.checkTokenExp(refreshToken.payload.exp, accessToken.payload.exp)

		const user = await this.getRefreshToken(refreshToken.payload.sub)

		await this.checkTokensMatch(data.refreshToken, user.refreshToken[0].token)

		const newToken = await this.jwtManager.generateToken({
			id: user.id,
			name: user.name,
			username: user.username
		})

		const hashedNewToken = await this.hashNewToken(newToken.refreshToken)

		await this.refreshTokenRepository.update({
			...user.refreshToken[0],
			revoked: true
		})

		await this.storeRefreshToken({
			expiresAt: newToken.accessTokenExp,
			refreshToken: hashedNewToken,
			userAgent: data.userAgent,
			userId: user.id
		})

		return {
			id: user.id,
			name: user.name,
			username: user.username,
			email: user.email ? user.email : undefined,
			token: {
				accessToken: newToken.accessToken,
				refreshToken: newToken.refreshToken,
				expiresIn: newToken.accessTokenExp
			}
		}
	}

	private checkTokensSubMatch(
		accessTokenSub: unknown,
		refreshTokenSub: unknown
	): asserts refreshTokenSub is string {
		if (
			typeof accessTokenSub !== 'string' ||
			typeof refreshTokenSub !== 'string' ||
			refreshTokenSub !== accessTokenSub
		) {
			throw new AppError({
				name: 'Forbidden',
				message: 'Action Denied!'
			})
		}
	}

	private async verifySignature(
		token: string,
		type: 'refreshToken' | 'accessToken'
	): Promise<void> {
		try {
			const secret =
				type === 'refreshToken' ? this.REFRESH_SECRET_KEY : this.USER_SECRET_KEY

			await verify(token, secret)
		} catch (error) {
			if (error instanceof JwtTokenSignatureMismatched) {
				throw new AppError({
					name: 'Unauthorized',
					message: 'Access Denied!'
				})
			}
		}
	}

	private async storeRefreshToken(data: StoreRefreshTokenInput): Promise<void> {
		const refreshTokenData = {
			revoked: false,
			token: data.refreshToken,
			userAgent: data.userAgent,
			userId: data.userId,
			expiresAt: new Date(data.expiresAt * 1000).toISOString()
		}
		const refreshToken = new RefreshToken(refreshTokenData)

		await this.refreshTokenRepository.create(refreshToken)
	}

	private async checkTokensMatch(
		clientToken: string,
		dbToken: string
	): Promise<void> {
		const decryptedToken = await this.webCryptoAES.decryptSymetric(dbToken)

		const isValid = clientToken === decryptedToken.plainText

		if (!isValid) {
			throw new AppError({
				name: 'Unauthorized',
				message: 'Access Denied!'
			})
		}
	}

	private async hashNewToken(refreshToken: string): Promise<string> {
		const encryptedClientToken =
			await this.webCryptoAES.encryptSymetric(refreshToken)

		if (!encryptedClientToken.cipherText || encryptedClientToken.error) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'Internal Server Error'
			})
		}

		return encryptedClientToken.cipherText
	}

	private async getRefreshToken(
		userId: string
	): Promise<IUsersDTO & { refreshToken: IRefreshTokenDTO[] }> {
		const user = await this.refreshTokenRepository.findManyByOr({
			id: userId,
			revoked: false,
			noExpired: true
		})

		if (user === null) {
			throw new AppError({
				name: 'Forbidden',
				message: 'Action Denied!'
			})
		}

		return user
	}

	private checkTokenExp(
		refreshTokenExp?: number,
		accessTokenExp?: number
	): void {
		const now = Math.floor(Date.now() / 1000)

		if (
			!refreshTokenExp ||
			!accessTokenExp ||
			refreshTokenExp < now ||
			accessTokenExp > now
		) {
			throw new AppError({
				name: 'Unauthorized',
				message: 'Invalid Token!'
			})
		}
	}

	private validateToken(data: {
		header: TokenHeader
		payload: JWTPayload
	}): void {
		if (
			!data.payload.iss ||
			!data.payload.sub ||
			data.payload.iss !== this.AUTH_ISSUER
		) {
			throw new AppError({
				name: 'Forbidden',
				message: 'Action Denied!'
			})
		}
	}

	private decodeTokens(data: IRefreshTokenParamsDTO): {
		refreshToken: { header: TokenHeader; payload: JWTPayload }
		accessToken: { header: TokenHeader; payload: JWTPayload }
	} {
		const refreshToken = decode(data.refreshToken)
		const accessToken = decode(data.accessToken)
		return { refreshToken, accessToken }
	}

	private validationInput(data: IRefreshTokenParamsDTO): void {
		const isValidData = refreshTokenSchema.check(data)

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
