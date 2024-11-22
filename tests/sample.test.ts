import { expect, test, describe, beforeAll } from 'vitest'
import app from '../src'
import { applyD1Migrations, env } from 'cloudflare:test'

describe('Example', () => {
    beforeAll(async () => {
        await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
    })
    
    test('Sample E2E test', async () => {
        const res = await app.request('/', {}, env)
        
        expect(res.status).toBe(200)
    })
})