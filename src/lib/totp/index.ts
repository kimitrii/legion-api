import crypto from 'node:crypto'

export class Totp {
	public generateSecret({
		service,
		user,
		algorithm
	}: {
		service: string
		user: string
		algorithm: 'SHA1' | 'SHA256' | 'SHA512'
	}): {
		secret?: string
		otpauthUrl?: string
		error?: string
	} {
		const urlParamRegex = /^[A-Za-z0-9_-]+$/
		if (!urlParamRegex.test(user)) {
			return { error: 'Invalid user.' }
		}
		if (!urlParamRegex.test(service)) {
			return { error: 'Invalid service.' }
		}

		const secret = this.generateTOTPSecret()
		const otpauthUrl = `otpauth://totp/${user}?secret=${secret}&issuer=${service}&algorithm=${algorithm}&digits=6&period=30`

		return {
			secret,
			otpauthUrl
		}
	}

	public check({
		secret,
		token,
		algorithm
	}: {
		secret: string
		token: string
		algorithm: 'sha1' | 'sha256' | 'sha512'
	}): { isValid: boolean; error?: string } {
		const window = 1

		const secretRegex = /^[A-Z2-7]+=*$/

		if (!secretRegex.test(secret)) {
			return { isValid: false, error: 'Invalid Base32 secret.' }
		}

		const tokenRegex = /^\d{6}$/

		if (!tokenRegex.test(token)) {
			return { isValid: false, error: 'Invalid token.' }
		}

		const currentTime = Math.floor(Date.now() / 1000 / 30)

		for (let i = -window; i <= window; i++) {
			const generatedToken = this.generateToken(
				secret,
				currentTime + i,
				algorithm
			)

			if (!generatedToken) {
				return {
					isValid: false,
					error: 'Invalid secret.'
				}
			}
			if (
				crypto.timingSafeEqual(Buffer.from(token), Buffer.from(generatedToken))
			) {
				return {
					isValid: true
				}
			}
		}

		return { isValid: false }
	}

	private toBase32(buffer: Buffer<ArrayBufferLike>): string {
		const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

		let bits = ''
		let base32 = ''

		for (const byte of buffer) {
			bits += byte.toString(2).padStart(8, '0')
		}

		for (let i = 0; i < bits.length; i += 5) {
			const chunk = bits.slice(i, i + 5)
			base32 += base32Chars[Number.parseInt(chunk.padEnd(5, '0'), 2)]
		}

		return base32
	}

	private generateToken(
		secret: string,
		counter: number,
		algorithm: 'sha1' | 'sha256' | 'sha512'
	): string | null {
		const key = this.fromBase32(secret)

		if (!key) {
			return null
		}

		const buffer = Buffer.alloc(8)
		let localCounter = counter

		for (let i = 7; i >= 0; i--) {
			buffer[i] = localCounter & 0xff
			localCounter >>= 8
		}

		const hmac = crypto.createHmac(algorithm, key).update(buffer).digest()
		const offset = hmac[hmac.length - 1] & 0xf
		const code =
			((hmac[offset] & 0x7f) << 24) |
			((hmac[offset + 1] & 0xff) << 16) |
			((hmac[offset + 2] & 0xff) << 8) |
			(hmac[offset + 3] & 0xff)

		return (code % 10 ** 6).toString().padStart(6, '0')
	}

	private fromBase32(base32: string): Buffer | null {
		const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
		let bits = ''

		for (const char of base32.toUpperCase()) {
			const index = base32Chars.indexOf(char)
			if (index === -1) {
				return null
			}
			bits += index.toString(2).padStart(5, '0')
		}

		const bytes = []
		for (let i = 0; i < bits.length; i += 8) {
			bytes.push(Number.parseInt(bits.slice(i, i + 8).padEnd(8, '0'), 2))
		}

		return Buffer.from(bytes)
	}

	private generateTOTPSecret(): string {
		const binarySecret = crypto.randomBytes(20)
		const base32Secret = this.toBase32(binarySecret)
		return base32Secret
	}
}
