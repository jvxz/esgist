import { Effect } from 'effect'
import { fetchGistData } from './sequences/fetch-gist-data'
import { handleConfigDeps } from './sequences/handle-config-deps'
import { handleConfigWrite } from './sequences/handle-config-write'
import { handleGistLink } from './sequences/handle-gist-link'
import { prepare } from './sequences/prepare'

export const run = Effect.gen(function* () {
  const { configFilename, packageManager, isNodeProject } = yield* prepare

  const gistLink = yield* handleGistLink
  const gistData = yield* fetchGistData(gistLink)

  // only install deps if in a node project
  if (isNodeProject) yield* handleConfigDeps(gistData.deps, packageManager)

  yield* handleConfigWrite(gistData.content, configFilename, packageManager)
})
