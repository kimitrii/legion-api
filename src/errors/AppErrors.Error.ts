export class AppError<T> extends Error {
	public constructor({
		name,
		message,
		cause
	}: {
		name:
			| 'Bad Request'
			| 'Unauthorized'
			| 'Forbidden'
			| 'Not Found'
			| 'Not Acceptable'
			| 'Conflict'
			| 'Unsupported Media Type'
			| 'Unprocessable Entity'
			| 'Too Many Requests'
			| 'Internal Server Error'
			| 'Service Unavailable'
		message: string
		cause?: T
	}) {
		super()
		this.message = message
		this.name = name
		this.cause = cause
	}
}
