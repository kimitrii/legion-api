import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { HTTPResponseError } from 'hono/types'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import {
	JwtAlgorithmNotImplemented,
	JwtHeaderInvalid,
	JwtTokenExpired,
	JwtTokenInvalid,
	JwtTokenIssuedAt,
	JwtTokenNotBefore,
	JwtTokenSignatureMismatched
} from 'hono/utils/jwt/types'

export const errorsHandler = (
	error: Error | HTTPResponseError,
	c: Context
): Response | Promise<Response> => {
	const errorMap: Record<string, { status: ContentfulStatusCode }> = {
		'Bad Request': { status: 400 },
		Unauthorized: { status: 401 },
		Forbidden: { status: 403 },
		'Not Found': { status: 404 },
		'Not Acceptable': { status: 406 },
		Conflict: { status: 409 },
		'Unsupported Media Type': { status: 415 },
		'Unprocessable Entity': { status: 422 },
		'Too Many Requests': { status: 429 },
		'Service Unavailable': { status: 503 }
	}

	const mappedError = errorMap[error.name]

	if (mappedError) {
		return c.json(
			{ success: false, message: error.message, cause: error.cause },
			mappedError.status
		)
	}

	const jwtErrorTypes = [
		JwtTokenInvalid,
		JwtAlgorithmNotImplemented,
		JwtHeaderInvalid,
		JwtTokenExpired,
		JwtTokenIssuedAt,
		JwtTokenNotBefore,
		JwtTokenSignatureMismatched
	]

	if (jwtErrorTypes.some((ErrorType) => error instanceof ErrorType)) {
		return c.json(
			{
				success: false,
				message: error.message
			},
			401
		)
	}

	if (error instanceof HTTPException && error.stack?.includes('csrf')) {
		return c.json(
			{
				success: false,
				message: 'Access denied.'
			},
			403
		)
	}

	return c.json(
		{
			success: false,
			message: error.message ?? 'Internal server error',
			cause: error.cause
		},
		500
	)
}
