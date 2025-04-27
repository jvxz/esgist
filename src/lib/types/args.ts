import { type } from 'arktype'

export const argsSchema = type({
  'gist?': 'string.url',
  'yes?': 'boolean',
})

export type Args = typeof argsSchema.infer
