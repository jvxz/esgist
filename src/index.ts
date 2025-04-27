import * as p from '@clack/prompts'
import { FetchHttpClient } from '@effect/platform'
import c from 'ansis'
import { cac } from 'cac'
import { Cause, Effect, Exit } from 'effect'
import { name, version } from '../package.json'
import { run } from './run'

function header() {
  p.intro(`${c.bold.white`${name} `}${c.dim`${version}`}`)
}

const cli = cac(name)

cli
  .command('', 'Run the wizard')
  .option('--yes, -y', '', {
    default: false,
  })
  .option('--template, -t <template>', '', {
    type: [],
  })
  .action(async () => {
    header()

    const exit = await run
      .pipe(Effect.provide(FetchHttpClient.layer))
      .pipe(Effect.runPromiseExit)

    if (Exit.isFailure(exit)) {
      p.log.error(c.inverse.red(' An error occurred... '))
      p.log.error(c.red`${Cause.pretty(exit.cause)}`)
      process.exit(1)
    }

    p.outro('Done! 🎉')
  })

cli.help()
cli.version(version)
cli.parse()
