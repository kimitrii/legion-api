import { validator } from '@src/lib/validator'

export const createUserSchema = validator.schema({
	name: validator.string().max(256).min(1),
	username: validator.string().max(256).min(1),
	password: validator.string().max(256).nullable(),
	email: validator.string().email().max(256).nullable(),
	kats: validator.number().nullable(),
	rank: validator.number().nullable()
})
