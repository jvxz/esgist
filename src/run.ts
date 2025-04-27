import type { Args } from './lib/types/args'
import { Effect } from 'effect'
import { fetchGistData } from './sequences/fetch-gist-data'
import { handleConfigDeps } from './sequences/handle-config-deps'
import { handleConfigWrite } from './sequences/handle-config-write'
import { handleGistLink } from './sequences/handle-gist-link'
import { prepare } from './sequences/prepare'
import { validateArgs } from './sequences/validate-args'

export function run(rawArgs: Args) {
  return Effect.gen(function* () {
    const args = yield* validateArgs(rawArgs)

    const { configFilename, packageManager, isNodeProject } = yield* prepare

    const gistLink = yield* handleGistLink(args.gist)
    const gistData = yield* fetchGistData(gistLink)

    // only install deps if in a node project
    if (isNodeProject) yield* handleConfigDeps(gistData.deps, packageManager)

    yield* handleConfigWrite(gistData.content, configFilename, packageManager)
  })
}
