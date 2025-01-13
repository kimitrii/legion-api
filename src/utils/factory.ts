import type { Env } from '@src/types/bindTypes'
import { createFactory } from 'hono/factory'

export const factory = createFactory<{ Bindings: Env }>()
