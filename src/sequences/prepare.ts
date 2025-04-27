import type { AgentName } from 'package-manager-detector'
import type { Args } from '../lib/types/args'
import { readdir, readFile } from 'node:fs/promises'
import * as p from '@clack/prompts'
import c from 'ansis'
import { Data, Effect, Option } from 'effect'
import { execa } from 'execa'
import { detect } from 'package-manager-detector'
import { abort, withCancel } from '../lib/utils'

const DEFAULT_PM = 'npm'

class PrepError extends Data.TaggedError('PrepError')<{
  cause?: unknown
  message?: string
}> {}

function handleUncommittedChanges(args: Args) {
  return Effect.gen(function* (_) {
    if (args.yes) return Effect.void

    const gitStatus = yield* _(
      Effect.tryPromise({
        try: async () => execa('git', ['status', '--porcelain']),
        catch: e => new PrepError({
          cause: e,
          message: 'Failed to get git status',
        }),
      }),
      Effect.option,
    )

    if (Option.isNone(gitStatus)) return Effect.void

    const confirm = yield* Effect.tryPromise({
      try: async () => withCancel(async () => p.confirm({
        message: 'There are uncommitted changes. Continue anyway?',
        initialValue: false,
      })),
      catch: e => new PrepError({
        cause: e,
        message: 'Failed to confirm uncommitted changes',
      }),
    })

    if (!confirm) return abort()

    return Effect.void
  })
}

function handleNodeProject(yes: Args['yes']) {
  return Effect.gen(function* (_) {
    if (yes) return false

    const packageJson = yield* _(Effect.tryPromise(async () => readFile('package.json')), Effect.option)

    if (Option.isNone(packageJson)) {
      const confirm = yield* Effect.tryPromise({
        try: async () => withCancel(async () => p.confirm({
          message: 'You don\'t seem to be in a Node.js project. Continue anyway?',
          initialValue: true,
        })),
        // TODO allow manual override via args (--node-project)
        catch: e => new PrepError({
          cause: e,
          message: 'Failed to read package.json',
        }),
      })

      if (confirm) return false
    }

    return true
  })
}

function getConfig(yes: Args['yes']): Effect.Effect<PrepareResult['configFilename'] | void, PrepError> {
  return Effect.gen(function* (_) {
    const dir = yield* _(Effect.tryPromise(async () => readdir(process.cwd())), Effect.option)

    if (Option.isNone(dir)) {
      p.log.warn('Could not scan directory. Defaulting to gist file name')
      return yield* Effect.void
    }

    const config = yield* _(
      Effect.succeed(dir.value.filter(e => e.includes('eslint'))),
      Effect.map(e => e.filter(e => e.includes('js'))),
    )

    // const _ignore = yield* _(
    //   Effect.fromNullable(dir.value.find(e => e.includes('.eSLintignore'))),
    //   Effect.option,
    // )

    if (config.length === 0) return yield* Effect.void

    if (config.length > 1) {
      if (!yes) {
        yield* _(
          Effect.tryPromise({
            try: async () => withCancel(async () => p.confirm({
              message: 'Found multiple ESLint config files. Select to overwrite?',
              initialValue: true,
            })),
            catch: e => new PrepError({
              cause: e,
              message: 'Failed to confirm ESLint config file',
            }),
          }),
          Effect.map((confirm) => {
            if (!confirm) abort()
            return confirm
          }),
        )
      }

      const selectedFile = yield* Effect.tryPromise({
        try: async () => withCancel(async () => p.select({
          message: 'Select the desired file',
          options: config.map((e) => {
            return {
              label: e,
              value: e,
            }
          }),
        })),
        catch: e => new PrepError({
          cause: e,
          message: 'Failed to select ESLint config file',
        }),
      })

      return selectedFile
    }

    if (!yes) {
      yield* _(Effect.tryPromise({
        try: async () => withCancel(async () => p.confirm({
          message: `ESLint config file found: ${c.bold.yellow(`\`${config[0]}\``)}. Overwrite?`,
          initialValue: true,
        })),
        catch: e => new PrepError({
          cause: e,
          message: 'Failed to confirm ESLint config file',
        }),
      }), Effect.map((confirm) => {
        if (!confirm) abort()
        return confirm
      }))
    }

    return config[0]
  })
}

const getPm = Effect.gen(function* (_) {
  const pm = yield* _(
    Effect.tryPromise(async () => detect()),
    Effect.filterOrElse(
      e => e !== null,
      () => Effect.succeed(DEFAULT_PM),
    ),
    Effect.option,
  )

  if (Option.isNone(pm)) return DEFAULT_PM

  return pm.value
})

export interface PrepareResult {
  configFilename: string
  packageManager: AgentName
  isNodeProject: boolean
}

export function prepare(args: Args) {
  return Effect.gen(function* () {
    yield* handleUncommittedChanges(args)

    const packageManager = yield* getPm
    const isNodeProject = yield* handleNodeProject(args.yes)
    const configFilename = yield* getConfig(args.yes)

    return {
      configFilename,
      packageManager,
      isNodeProject,
    } as PrepareResult
  })
}

