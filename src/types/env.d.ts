declare module 'cloudflare:test' {
	interface ProvidedEnv extends Env {
		DB: D1Database
		TEST_MIGRATIONS: D1Migration[]
	}
}
