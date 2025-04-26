import { Effect } from 'effect'
import { gistLinkPrompt } from './commands/gist-link'

export const run = Effect.gen(function* (_) {
  const gistLink = yield* _(gistLinkPrompt)

  return gistLink
})
