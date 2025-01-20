import { validator } from '@src/lib/validator'

export const listUsersSchema = validator.schema(
	{
		page: validator.number(),
		includeDeleted: validator.string().equals('true').nullable()
	},
	{
		strict: true
	}
)
