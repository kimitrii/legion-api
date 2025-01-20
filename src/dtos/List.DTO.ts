export interface IListDTO {
	page: number
	includeDeleted: string | undefined
}

export interface IListResultDTO<T> {
	users: T[]
	pagination: {
		totalPages: number
		totalItems: number
		isLastPage: boolean
	}
}
