import path from 'node:path'
import {
	defineWorkersConfig,
	readD1Migrations
} from '@cloudflare/vitest-pool-workers/config'
import dotenv from 'dotenv'

dotenv.config()

export default defineWorkersConfig(async () => {
	const migrations = await readD1Migrations('./src/migrations')
	return {
		resolve: {
			alias: {
				'@src': path.resolve(__dirname, './src'),
				'@tests': path.resolve(__dirname, './tests')
			}
		},
		test: {
			globals: true,
			poolOptions: {
				workers: {
					isolatedStorage: true,
					miniflare: {
						d1Databases: {
							DB: 'db-tests'
						},
						bindings: {
							TEST_MIGRATIONS: migrations,
							USER_SECRET_KEY: process.env.USER_SECRET_KEY ?? '',
							REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY ?? ''
						},
						compatibilityDate: '2024-11-20',
						compatibilityFlags: ['nodejs_compat']
					}
				}
			}
		}
	}
})
