import { HttpClient, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { Data, Effect, Option, Schema } from 'effect'

const GIST_ID_REGEX = /https:\/\/gist\.github\.com\/[A-Z]+\/([A-Z]+(?:\d+[A-Z]+)+)/i

class GistLinkDataError extends Data.TaggedError('GistLinkDataError')<{
  cause?: unknown
  message?: string
}> {}

const schema = Schema.Struct({
  files: Schema.Record({
    key: Schema.String,
    value: Schema.Struct({
      content: Schema.String,
    }),
  }),
})

export function fetchGistData(gistLink: string) {
  return Effect.gen(function* (_) {
    const gistId = yield* Effect.fromNullable(gistLink.match(GIST_ID_REGEX)?.[1])

    const client = yield* HttpClient.HttpClient
    const request = HttpClientRequest.get(`https://api.github.com/gists/${gistId}`).pipe(HttpClientRequest.setHeaders({
      Accept: 'application/vnd.github.v3+json',
      gist_id: gistId,
    }))

    const gistData = yield* _(
      client.execute(request),
      Effect.flatMap(HttpClientResponse.schemaBodyJson(schema)),
      Effect.option,
    )

    if (Option.isNone(gistData)) {
      return yield* Effect.fail(new GistLinkDataError({
        message: 'An error occurred while fetching gist data. Did you provide a valid gist link?',
      }))
    }

    return gistData.value.files
  })
}
