import * as p from '@clack/prompts'
import { HttpClient, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { parse } from 'acorn'
import { Data, Effect, Option } from 'effect'
import { GistDataSchema } from '../lib/types/gist-data'
import { withCancel } from '../lib/utils'

const GIST_ID_REGEX = /https:\/\/gist\.github\.com\/[A-Z0-9]+\/([A-Z0-9]+)/i

class GistLinkDataError extends Data.TaggedError('GistLinkDataError')<{
  cause?: unknown
  message?: string
}> {}

export function fetchGistData(
  gistLink: string,
  force: boolean | undefined,
) {
  return Effect.gen(function* (_) {
    const gistId = gistLink.match(GIST_ID_REGEX)?.[1]

    const client = yield* HttpClient.HttpClient
    const req = HttpClientRequest.get(`https://api.github.com/gists/${gistId}`).pipe(HttpClientRequest.setHeaders({
      Accept: 'application/vnd.github.v3+json',
      gist_id: gistId,
    }))

    const { files: gistFiles } = yield* _(
      client.execute(req),
      Effect.flatMap(HttpClientResponse.schemaBodyJson(GistDataSchema)),
      Effect.filterOrFail(
        data => data !== null && data !== undefined,
        () => new GistLinkDataError({
          message: 'Could not get data from Gist. The URL could be invalid, the Gist could be secret, or you could be rate limited',
        }),
      ),
      Effect.mapError(e => new GistLinkDataError({
        cause: e,
        message: 'Could not get data from Gist. The URL could be invalid, the Gist could be secret, or you could be rate limited',
      })),
    )

    const gistFileNames = Object.keys(gistFiles)

    if (gistFileNames.length > 1) {
      const selectedGistFileName = yield* _(Effect.tryPromise({
        try: async () => withCancel(async () => p.select({
          message: 'Select a file:',
          options: gistFileNames.map((name) => {
            return {
              label: name,
              value: name,
            }
          }),
        })),
        catch: e => new GistLinkDataError({
          cause: e,
          message: 'Failed to select file',
        }),
      }))

      const deps = yield* _(
        Effect.fromNullable(gistFiles[selectedGistFileName]),
        Effect.map(file => file.content.split('\n').slice(0, 10)),
        Effect.mapError(e => new GistLinkDataError({
          cause: e,
          message: 'Failed to get content from Gist',
        })),
      )

      if (!force) yield* validateGistData(gistFiles[selectedGistFileName]!.content)

      return {
        deps,
        content: gistFiles[selectedGistFileName]!.content,
        name: selectedGistFileName,
      }
    }

    const deps = yield* _(
      Effect.fromNullable(gistFiles[gistFileNames[0]!]),
      Effect.map(file => file.content.split('\n').splice(0, 10)),
      Effect.mapError(e => new GistLinkDataError({
        cause: e,
        message: 'Failed to get content from Gist',
      })),
    )

    if (!force) yield* validateGistData(gistFiles[gistFileNames[0]!]!.content)

    return {
      deps,
      content: gistFiles[gistFileNames[0]!]!.content,
      name: gistFileNames[0]!,
    }
  })
}

/*
validates gist data to be a valid eslint config (javascript or json)
*/
function validateGistData(data: string) {
  return Effect.gen(function* (_) {
    const js = yield* _(
      Effect.try(() => parse(data, {
        ecmaVersion: 'latest',
        sourceType: 'module',
      })),
      Effect.option,
    )

    const json = yield* _(
      // eslint-disable-next-line ts/no-unsafe-return
      Effect.tryPromise(() => JSON.parse(data)),
      Effect.option,
    )

    if (Option.isSome(js)) return 'js'
    if (Option.isSome(json)) return 'json'

    return yield* Effect.fail(new GistLinkDataError({
      message: 'The Gist data is not valid JavaScript or JSON. Add the --force argument to bypass',
    }))
  })
}
