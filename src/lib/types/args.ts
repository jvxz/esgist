import { type } from 'arktype'

const AgentValidator = type('"npm" | "yarn" | "pnpm" | "bun" | "deno"')

export const argsSchema = type({
  'gist?': 'string.url',
  'yes?': 'boolean',
  'packageManager?': AgentValidator,
  'force?': 'boolean',
})

export type Args = typeof argsSchema.infer
