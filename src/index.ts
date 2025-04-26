import process from 'node:process'
import * as p from '@clack/prompts'
import c from 'ansis'
import { cac } from 'cac'
import { version } from '../package.json'

function header() {
  p.intro(`${c.hex('#FEF0F5')`@jvxz/pura `}${c.dim`${version}`}`)
}

function outro() {
  p.outro('Done! 🎉')
}

const cli = cac('@jvxz/pura')

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
    try {
      p.log.message('Hello, world!')
    }
    catch (error) {
      p.log.error(c.inverse.red(' Failed to migrate '))
      p.log.error(c.red`✘ ${String(error)}`)
      process.exit(1)
    }
    outro()
  })

cli.help()
cli.version(version)
cli.parse()
