import { validator } from '@src/lib/validator'

export const OTPAuthSchema = validator.schema(
	{
		username: validator.string().max(256).nullable(),
		email: validator.string().email().max(256).nullable(),
		token: validator.string().max(10).min(1)
	},
	{
		strict: true
	}
)
