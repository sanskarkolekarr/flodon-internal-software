import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Root .env is 3 levels up from packages/core/src
dotenv.config({ path: join(__dirname, '../../../../.env') })

export * from './supabase.js'
export * from './config.js'
export * from './utils/logger.js'
export * from './utils/embedBuilders.js'
export * from './utils/warroom.js'
export * from './utils/milestones.js'
