import * as p from '@clack/prompts'

/**
 * wraps a function in a cancelable promise
 */
export async function withCancel(fn: () => Promise<string | symbol>) {
  const res = await fn()

  if (p.isCancel(res)) {
    p.outro('Aborting...')
    process.exit(1)
  }

  return res
}
