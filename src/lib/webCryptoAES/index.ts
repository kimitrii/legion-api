import crypto from 'node:crypto'

export class WebCryptoAES {
	private secretKey: string

	public constructor({ secret }: { secret: string }) {
		this.secretKey = secret
	}

	public async encryptSymetric(
		plainText: string
	): Promise<{ cipherText?: string; error?: string }> {
		const secretKeyBuffer = Buffer.from(this.secretKey, 'base64')

		if (![16, 24, 32].includes(secretKeyBuffer.length)) {
			return {
				error: 'Invalid secret length. Must be 128, 192, or 256 bits.'
			}
		}

		const iv = crypto.getRandomValues(new Uint8Array(12))

		const encodePlainText = new TextEncoder().encode(plainText)

		const secretKey = await crypto.subtle.importKey(
			'raw',
			Buffer.from(this.secretKey, 'base64'),
			{
				name: 'AES-GCM',
				length: 256
			},
			true,
			['encrypt']
		)

		const cipherText = await crypto.subtle.encrypt(
			{
				name: 'AES-GCM',
				iv: iv.buffer
			},
			secretKey,
			encodePlainText
		)

		const result = `${Buffer.from(iv).toString('base64')}:${Buffer.from(cipherText).toString('base64')}`

		return {
			cipherText: result
		}
	}

	public async decryptSymetric(
		cipherText: string
	): Promise<{ plainText?: string; error?: string }> {
		const secretKeyBuffer = Buffer.from(this.secretKey, 'base64')

		if (![16, 24, 32].includes(secretKeyBuffer.length)) {
			return {
				error: 'Invalid secret length. Must be 128, 192, or 256 bits.'
			}
		}

		const [inputIv, encryptedText] = cipherText.split(':')

		if (!inputIv || !encryptedText) {
			return {
				error: 'Invalid ciphertext format. Expected IV:cipherText.'
			}
		}

		try {
			const iv = Buffer.from(inputIv, 'base64')

			const secretKey = await crypto.subtle.importKey(
				'raw',
				Buffer.from(this.secretKey, 'base64'),
				{
					name: 'AES-GCM',
					length: 256
				},
				true,
				['decrypt']
			)

			const clearText = await crypto.subtle.decrypt(
				{
					name: 'AES-GCM',
					iv: iv.buffer
				},
				secretKey,
				Buffer.from(encryptedText, 'base64')
			)

			return {
				plainText: new TextDecoder().decode(clearText)
			}
		} catch (error) {
			if (error instanceof DOMException) {
				return {
					error: 'Decryption failed. The provided ciphertext or key is invalid.'
				}
			}
			return { error: 'WebCrytoAES internal error' }
		}
	}
}
