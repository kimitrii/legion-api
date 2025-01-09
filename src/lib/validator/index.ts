import { ArrayValidation } from './ArrayOf.Validation'
import type { ValidationBase } from './Base.Validation'
import { BooleanValidation } from './Boolean.Validation'
import { NumberValidation } from './Number.Validation'
import { ObjectValidation } from './Object.Validation'
import { SchemaValidation } from './Schema.Validation'
import { StringValidation } from './String.Validation'

export const validator = {
	string: (): StringValidation => new StringValidation(),
	number: (): NumberValidation => new NumberValidation(),
	boolean: (): BooleanValidation => new BooleanValidation(),
	schema: <T extends Record<string, unknown>>(
		schema: Record<keyof T, ValidationBase>
	): SchemaValidation<T> => new SchemaValidation(schema),
	object: (schema: Record<string, ValidationBase>): ObjectValidation =>
		new ObjectValidation(schema),
	arrayOf: (schema: ValidationBase): ArrayValidation =>
		new ArrayValidation(schema)
}
