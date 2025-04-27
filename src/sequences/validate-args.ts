import type { Args } from '../lib/types/args'
import { ArkErrors } from 'arktype'
import { Data, Effect } from 'effect'
import { argsSchema } from '../lib/types/args'

class ArgsValidationError extends Data.TaggedError('ArgsValidationError')<{
  cause?: unknown
  message?: string
}> {}

export function validateArgs(rawArgs: Args) {
  return Effect.gen(function* (_) {
    const res = argsSchema(rawArgs)

    if (res instanceof ArkErrors) {
      throw new ArgsValidationError({
        message: `Invalid arguments: ${res.summary}`,
        cause: res.summary,
      })
    }

    return res
  })
}
