import { validator } from '@src/lib/validator'

export const enableOTPSchema = validator.schema(
	{
		userId: validator.string().ulid(),
		token: validator.string().max(10).min(1)
	},
	{
		strict: true
	}
)
