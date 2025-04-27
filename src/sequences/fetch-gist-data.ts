import * as p from '@clack/prompts'
import { HttpClient, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { Data, Effect } from 'effect'
import { GistDataSchema } from '../lib/types/gist-data'
import { withCancel } from '../lib/utils'

const GIST_ID_REGEX = /https:\/\/gist\.github\.com\/[A-Z0-9]+\/([A-Z0-9]+)/i

class GistLinkDataError extends Data.TaggedError('GistLinkDataError')<{
  cause?: unknown
  message?: string
}> {}

export function fetchGistData(gistLink: string) {
  return Effect.gen(function* (_) {
    const gistId = gistLink.match(GIST_ID_REGEX)?.[1]

    const client = yield* HttpClient.HttpClient
    const request = HttpClientRequest.get(`https://api.github.com/gists/${gistId}`).pipe(HttpClientRequest.setHeaders({
      Accept: 'application/vnd.github.v3+json',
      gist_id: gistId,
    }))

    const { files: gistFiles } = yield* _(
      client.execute(request),
      Effect.flatMap(HttpClientResponse.schemaBodyJson(GistDataSchema)),
      Effect.filterOrFail(
        data => data !== null && data !== undefined,
        () => new GistLinkDataError({
          message: 'Could not get data from gist. Check if the gist link is valid and available publicly.',
        }),
      ),
      Effect.mapError(e => new GistLinkDataError({
        cause: e,
        message: 'Could not get data from gist. Check if the gist link is valid and available publicly.',
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
      const content = yield* _(
        Effect.fromNullable(gistFiles[selectedGistFileName]),
        Effect.map(file => file.content.split('\n').slice(0, 10)),
        Effect.mapError(e => new GistLinkDataError({
          cause: e,
          message: 'Failed to get content from gist',
        })),
      )
      return content
    }

    const content = yield* _(
      Effect.fromNullable(gistFiles[gistFileNames[0]!]),
      Effect.map(file => file.content.split('\n').splice(0, 10)),
      Effect.mapError(e => new GistLinkDataError({
        cause: e,
        message: 'Failed to get content from gist',
      })),
    )
    return content
  })
}
