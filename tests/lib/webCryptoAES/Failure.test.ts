import { WebCryptoAES } from '@src/lib/webCryptoAES'
import { describe, expect, test } from 'vitest'

describe('WebCryptoAES failure Library', () => {
	const secret = Buffer.from(
		crypto.getRandomValues(new Uint8Array(32))
	).toString('base64')

	test('should failure when secret is not 128, 192, or 256 bits for encrypt', async () => {
		const webCryptoAES = new WebCryptoAES({ secret: 'invalid-secret' })

		const encryptResult = await webCryptoAES.encryptSymetric(
			'Encrypt this string'
		)

		expect(encryptResult).toStrictEqual({
			error: 'Invalid secret length. Must be 128, 192, or 256 bits.'
		})
	})

	test('should failure when secret is not 128, 192, or 256 bits for decrypt', async () => {
		const webCryptoAES = new WebCryptoAES({ secret: 'invalid-secret' })

		const decrypt = await webCryptoAES.decryptSymetric(
			'nSeNyvLACPCyYF6C:QxuhPDMU3KYiJR8UDWFxzACc'
		)

		expect(decrypt).toStrictEqual({
			error: 'Invalid secret length. Must be 128, 192, or 256 bits.'
		})
	})

	test('should failure when invalid ciphertext format for decrypt', async () => {
		const webCryptoAES = new WebCryptoAES({ secret })

		const decrypt = await webCryptoAES.decryptSymetric(
			'QxuhPDMU3KYiJR8UDWFxzACc'
		)

		expect(decrypt).toStrictEqual({
			error: 'Invalid ciphertext format. Expected IV:cipherText.'
		})
	})

	test('should failure when secret and plainText not match for decrypt', async () => {
		const webCryptoAES = new WebCryptoAES({ secret })

		const decrypt = await webCryptoAES.decryptSymetric(
			'nSeNyvLACPCyYF6C:QxuhPDMU3KYiJR8UDWFxzACc'
		)

		expect(decrypt).toStrictEqual({
			error: 'Decryption failed. The provided ciphertext or key is invalid.'
		})
	})
})
