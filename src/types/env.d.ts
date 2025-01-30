declare module 'cloudflare:test' {
	interface ProvidedEnv extends Env {
		DB: D1Database
		TEST_MIGRATIONS: D1Migration[]
		USER_SECRET_KEY: string
		REFRESH_SECRET_KEY: string
		AUTH_ISSUER: string
	}
}
