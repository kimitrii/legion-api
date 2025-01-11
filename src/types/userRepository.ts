export type FindByParams = {
	id?: string
	email?: string | null
	username?: string | null
} & ({ id: string } | { email: string } | { username: string })
