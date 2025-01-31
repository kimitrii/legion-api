export type Env = {
	DB: D1Database
	KV: KVNamespace
	USER_SECRET_KEY: string
	REFRESH_SECRET_KEY: string
	AUTH_ISSUER: string
	OTP_SECRET: string
}
