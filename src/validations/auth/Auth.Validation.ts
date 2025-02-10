import { validator } from '@src/lib/validator'

export const authSchema = validator.schema(
	{
		username: validator.string().max(256).min(1).nullable(),
		password: validator.string().max(256).min(8),
		email: validator.string().email().max(256).nullable(),
		userAgent: validator.string().max(256).nullable()
	},
	{
		strict: true
	}
)
