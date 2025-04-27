import type { AgentName } from 'package-manager-detector'
import * as p from '@clack/prompts'
import { Data, Effect } from 'effect'
import { execa } from 'execa'
import { withCancel } from '../lib/utils'

const JS_IMPORT_REGEX = /^import\s[\s\S]*?\sfrom\s+['"](@[^/]+\/[^/]+|[^/]+)(?:\/.*)?['"];?/

class GistDepsError extends Data.TaggedError('GistDepsError')<{
  cause?: unknown
  message?: string
}> {}

export function handleConfigDeps(lines: string[], pm: AgentName) {
  return Effect.gen(function* (_) {
    const pkgs = getPkgs(lines)

    const depsRes = yield* Effect.tryPromise({
      try: async () => withCancel(async () => p.multiselect({
        message: 'Select packages to install (select none to skip):',
        options: pkgs.map((pkg) => {
          return {
            label: pkg,
            value: pkg,
          }
        }),
        initialValues: pkgs,
        required: false,
      })),
      catch: e => new GistDepsError({
        cause: e,
        message: 'Failed to select packages',
      }),
    })

    if (depsRes.length > 0) {
      yield* Effect.tryPromise({
        try: async () => withCancel(async () => p.tasks([
          {
            title: `Installing dependencies with ${pm}`,
            task: async () => {
              await execa(pm, ['install', '--save-dev', ...depsRes])
              return 'Dependencies installed'
            },
          },
        ])),
        catch: e => new GistDepsError({
          cause: e,
          message: 'Failed to install packages',
        }),
      })
    }
  })
}

function getPkgs(lines: string[]) {
  const pkgs: string[] = []

  for (const raw of lines) {
    const line = raw.trim()

    if (line === '' || line.startsWith('//')) continue

    const m = line.match(JS_IMPORT_REGEX)

    if (m) {
      pkgs.push(m[1]!)
    }

    else {
      break
    }
  }

  return pkgs
}
