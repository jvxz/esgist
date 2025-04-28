import type { Args } from '../lib/types/args'
import * as p from '@clack/prompts'
import { ArkErrors, type } from 'arktype'
import { Data, Effect } from 'effect'
import { withCancel } from '../lib/utils'

const validator = type('string.url')

class GistLinkError extends Data.TaggedError('GistLinkError')<{
  cause?: unknown
  message?: string
}> {}

export function handleGistLink(gist: Args['gist']) {
  return Effect.gen(function* (_) {
    if (gist) return gist

    const res = yield* _(Effect.tryPromise({
      try: async () => withCancel(async () => p.text({
        message: 'Enter the URL of the Gist:',
        placeholder: 'https://gist.github.com/...',
        validate(value) {
          if (validator(value) instanceof ArkErrors) return 'Invalid URL'
        },
      })),
      catch: e => new GistLinkError({
        cause: e,
        message: 'Failed to parse response',
      }),
    }))

    if (!res) {
      return yield* Effect.fail(new GistLinkError({
        message: 'Gist link is required',
      }))
    }

    return res
  })
}
