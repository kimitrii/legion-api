import { validator } from '@src/lib/validator'

export const idSchema = validator.schema(
	{
		id: validator.string().ulid()
	},
	{
		strict: true
	}
)
