import { Otp } from '@src/entities/Otp.Entity'
import type { User } from '@src/entities/User.Entity'
import { AppError } from '@src/errors/AppErrors.Error'
import { Totp } from '@src/lib/totp'
import { WebCryptoAES } from '@src/lib/webCryptoAES'
import type { OtpRepository } from '@src/repositories/auth/Otp.Repository'

export class SetupUserOtpService {
	public constructor(
		private readonly otpsRepository: OtpRepository,
		private readonly otpSecret: string
	) {}

	public async excecute(
		user: User,
		isTotpEnable: boolean
	): Promise<{ secret: string | undefined; otpAuthUrl: string | undefined }> {
		if (!isTotpEnable) {
			return { otpAuthUrl: undefined, secret: undefined }
		}

		const secret = this.generateSecret(user.username)

		const hashedTotp = await this.encryptSecret(secret.secret)

		const otp = new Otp({
			otpHash: hashedTotp.cipherText,
			userId: user.id,
			createdAt: new Date().toISOString()
		})

		await this.otpsRepository.create(otp)

		return { otpAuthUrl: secret.otpauthUrl, secret: secret.secret }
	}

	private async encryptSecret(secret: string): Promise<{ cipherText: string }> {
		const webCryptoAES = new WebCryptoAES({ secret: this.otpSecret })

		const hashedTotp = await webCryptoAES.encryptSymetric(secret)

		if (hashedTotp.error || !hashedTotp.cipherText) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'Failed to generate TOTP'
			})
		}

		return {
			cipherText: hashedTotp.cipherText
		}
	}

	private generateSecret(username: string): {
		secret: string
		otpauthUrl: string
	} {
		const totp = new Totp()

		const secret = totp.generateSecret({
			algorithm: 'SHA256',
			service: 'LegionKimitri',
			user: username
		})

		if (secret.error || !secret.secret || !secret.otpauthUrl) {
			throw new AppError({
				name: 'Internal Server Error',
				message: 'Error in TOTP secret generation'
			})
		}

		return {
			otpauthUrl: secret.otpauthUrl,
			secret: secret.secret
		}
	}
}
