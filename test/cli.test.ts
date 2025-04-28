import { execa } from 'execa'
import { describe, expect, it } from 'vitest'

describe('esgist CLI', () => {
  it('should error out due to the gist not being a valid eslint config', async () => {
    const res = await execa('bun', ['dist/cli.cjs', '-y', '--gist', 'https://gist.github.com/jvxz/9db836d76c05a679341d70d3835a66f3'], {
      reject: false,
    })

    expect(res.exitCode).toBe(1)
  })

  it('should successfully install a valid eslint config', async () => {
    const res = await execa('bun', ['dist/cli.cjs', '-y', '--gist', 'https://gist.github.com/jvxz/bc63c0c627c9293f0edc8d45b8c0b170'], {
      reject: false,
    })

    expect(res.exitCode).toBe(0)
  })
})
