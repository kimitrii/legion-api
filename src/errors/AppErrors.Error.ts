export class AppError extends Error {
	public constructor({
		name,
		message
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
	}) {
		super()
		this.message = message
		this.name = name
	}
}
