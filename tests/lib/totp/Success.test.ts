import crypto from 'node:crypto'
import { Totp } from '@src/lib/totp'
import { describe, expect, test } from 'vitest'

describe('Time based one tap password Library', () => {
	function generateToken(secret: string, counter: number): string {
		const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
		let bits = ''

		for (const char of secret.toUpperCase()) {
			const index = base32Chars.indexOf(char)
			if (index === -1) {
				throw new Error('Invalid Base32 secret')
			}
			bits += index.toString(2).padStart(5, '0')
		}

		const bytes = []
		for (let i = 0; i < bits.length; i += 8) {
			bytes.push(Number.parseInt(bits.slice(i, i + 8).padEnd(8, '0'), 2))
		}

		const key = Buffer.from(bytes)
		const buffer = Buffer.alloc(8)

		let localCounter = counter
		for (let i = 7; i >= 0; i--) {
			buffer[i] = localCounter & 0xff
			localCounter >>= 8
		}

		const hmac = crypto.createHmac('sha1', key).update(buffer).digest()
		const offset = hmac[hmac.length - 1] & 0xf
		const code =
			((hmac[offset] & 0x7f) << 24) |
			((hmac[offset + 1] & 0xff) << 16) |
			((hmac[offset + 2] & 0xff) << 8) |
			(hmac[offset + 3] & 0xff)

		return (code % 10 ** 6).toString().padStart(6, '0')
	}

	test('should generate secret and otpauth url and authenticate token successfully', () => {
		const totp = new Totp()

		const secret = totp.generateSecret({ name: 'LegionAPI' })

		expect(secret).toHaveProperty('secret')
		expect(secret).toHaveProperty('otpauthUrl')
		expect(secret.error).toBeUndefined()

		const currentTime = Math.floor(Date.now() / 1000 / 30)
		const token = generateToken(secret.secret ?? '', currentTime)

		const isValid = totp.check(secret.secret ?? '', token)
		expect(isValid).toStrictEqual({
			isValid: true
		})
	})
})
