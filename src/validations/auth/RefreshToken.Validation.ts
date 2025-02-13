import { validator } from '@src/lib/validator'

export const refreshTokenSchema = validator.schema(
	{
		accessToken: validator.string().max(300).min(1),
		refreshToken: validator.string().max(256).min(8),
		userAgent: validator.string().max(256).nullable()
	},
	{
		strict: true
	}
)
