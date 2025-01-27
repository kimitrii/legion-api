import { WebCryptoAES } from '@src/lib/webCryptoAES'
import { describe, expect, test } from 'vitest'

describe('WebCryptoAES Library', () => {
	const secret = Buffer.from(
		crypto.getRandomValues(new Uint8Array(32))
	).toString('base64')

	test('should encrypt and decrypt successfully', async () => {
		const webCryptoAES = new WebCryptoAES({ secret })
		let decryptResult: { plainText?: string; error?: string } = {}

		const encryptResult = await webCryptoAES.encryptSymetric(
			'Encrypt this string'
		)

		expect(encryptResult).toHaveProperty('cipherText')
		expect(encryptResult.error).toBeUndefined()

		if (encryptResult.cipherText) {
			const decrypt = await webCryptoAES.decryptSymetric(
				encryptResult.cipherText
			)

			decryptResult = { plainText: decrypt.plainText }
		}

		expect(decryptResult).toHaveProperty('plainText')
		expect(decryptResult.plainText).toBe('Encrypt this string')
		expect(decryptResult.error).toBeUndefined()
	})
})
