import { applyD1Migrations, env } from 'cloudflare:test'
import { beforeAll, describe, expect, test } from 'vitest'
import app from '../src'

describe('Example', () => {
	beforeAll(async () => {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
	})

	test('Sample E2E test', async () => {
		const res = await app.request('/', {}, env)

		expect(res.status).toBe(200)
	})
})
