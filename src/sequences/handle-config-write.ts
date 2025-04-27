import type { AgentName } from 'package-manager-detector'
import type { PrepareResult } from './prepare'
import { writeFile } from 'node:fs/promises'
import * as p from '@clack/prompts'
import c from 'ansis'
import { Data, Effect } from 'effect'

class ConfigWriteError extends Data.TaggedError('ConfigWriteError')<{
  cause?: unknown
  message?: string
}> {}

export function handleConfigWrite(
  content: string,
  filename: PrepareResult['configFilename'],
  pm: AgentName,
) {
  return Effect.gen(function* () {
    const s = p.spinner()

    s.start('Writing config file...')

    yield* Effect.tryPromise({
      try: async () => writeFile(filename, content),
      catch: e => new ConfigWriteError({
        cause: e,
        message: 'Failed to write config file',
      }),
    })

    s.stop(`Config file written. You can now run ${c.bold.yellow(`${pm} eslint . --fix`)}`)
  })
}
