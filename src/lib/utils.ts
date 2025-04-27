import * as p from '@clack/prompts'

/**
  @returns the result of the function, never a symbol

  @example
  ```ts
  const res = await withCancel(() => p.text({ message: 'Enter your name' }))
  ```
 */
export async function withCancel<T>(fn: () => Promise<T | symbol>) {
  const res = await fn()

  if (p.isCancel(res)) abort()

  return res as T
}

export function abort() {
  p.outro('Aborting...')
  process.exit(1)
}
