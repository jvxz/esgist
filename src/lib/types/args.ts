import { type } from 'arktype'

export const argsSchema = type({
  'gist?': 'string.url',
})

export type Args = typeof argsSchema.infer
