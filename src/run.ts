import { Console, Effect } from 'effect'
import { fetchGistData } from './commands/fetch-gist-data'
import { gistLinkPrompt } from './commands/gist-link'

export const run = Effect.gen(function* () {
  const gistLink = yield* gistLinkPrompt
  const gistData = yield* fetchGistData(gistLink)

  yield* Console.log(gistData)

  return gistData
})
