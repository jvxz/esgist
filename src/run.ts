import { Console, Effect } from 'effect'
import { fetchGistData } from './sequences/fetch-gist-data'
import { gistLinkPrompt } from './sequences/gist-link'
import { handleConfigDeps } from './sequences/handle-config-deps'
import { prepare } from './sequences/prepare'

export const run = Effect.gen(function* () {
  const {
    configFilename,
  } = yield* prepare

  const gistLink = yield* gistLinkPrompt
  const gistData = yield* fetchGistData(gistLink)
  yield* handleConfigDeps(gistData.deps)
  yield* Console.log(gistData.content)

  return gistData
})
