import { defineWorkersConfig, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig(async () => {
  const migrations = await readD1Migrations("./src/migrations")
  return {
    test: {
      globals: true,
      poolOptions: {
        workers: {
          isolatedStorage: true,
          miniflare: {
            bindings: {
              TEST_MIGRATIONS: migrations
            }
          },
          wrangler: {
            configPath: "./wrangler.toml"
          }
        }
      }
    }
  }
})
