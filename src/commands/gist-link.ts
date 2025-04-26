import * as p from '@clack/prompts'
import { ArkErrors, type } from 'arktype'
import { Data, Effect } from 'effect'
import { withCancel } from '../lib/utils'

const validator = type('string.url')

class GistLinkError extends Data.TaggedError('GistLinkError')<{
  cause?: unknown
  message?: string
}> {}

export const gistLinkPrompt = Effect.gen(function* () {
  const res = yield* Effect.tryPromise({
    try: async () => withCancel(async () => p.text({
      message: 'Enter the URL of the gist:',
      placeholder: 'https://gist.github.com/...',
      validate(value) {
        if (validator(value) instanceof ArkErrors) return 'Invalid URL'
      },
    })),
    catch: e => new GistLinkError({
      cause: e,
      message: 'Failed to parse response',
    }),
  })

  return res
})
