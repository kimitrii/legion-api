import { expect, test } from 'vitest'
import app from '../src'

test('Sample E2E test', async () => {
    const res = await app.request('/', {
        method: 'GET'
    })

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello Hono!')
})