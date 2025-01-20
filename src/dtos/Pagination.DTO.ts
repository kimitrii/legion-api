export interface IPaginationParamsDTO {
	limit: number
	page: number
	includeDeleted?: boolean
}

export interface PaginatedResult<T> {
	totalItems: number
	items: T[]
}
