import { validator } from '@src/lib/validator'

export const updateUserSchema = validator.schema(
	{
		id: validator.string().ulid(),
		name: validator.string().max(256).min(1),
		username: validator.string().max(256).min(1),
		email: validator.string().email().max(256).nullable()
	},
	{
		strict: true
	}
)
