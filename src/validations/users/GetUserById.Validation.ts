import { validator } from '@src/lib/validator'

export const getUserByIdSchema = validator.schema(
	{
		id: validator.string().ulid(),
		includeDeleted: validator.string().equals('true').nullable()
	},
	{
		strict: true
	}
)
