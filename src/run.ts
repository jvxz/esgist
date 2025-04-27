import { Effect } from 'effect'
import { fetchGistData } from './sequences/fetch-gist-data'
import { gistLinkPrompt } from './sequences/gist-link'
import { handleConfigDeps } from './sequences/handle-config-deps'

export const run = Effect.gen(function* () {
  const gistLink = yield* gistLinkPrompt
  const gistData = yield* fetchGistData(gistLink)
  const configDeps = yield* handleConfigDeps(gistData)

  // yield* Console.log(gistContent)

  return gistData
})
