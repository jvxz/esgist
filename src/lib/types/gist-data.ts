import { Schema } from 'effect'

export const GistDataSchema = Schema.Struct({
  files: Schema.Record({
    key: Schema.String,
    value: Schema.Struct({
      content: Schema.String,
    }),
  }),
})

export type GistData = typeof GistDataSchema.Type
export type GistFile = typeof GistDataSchema.Type['files']
export type GistFileContent = typeof GistDataSchema.Type['files'][string]['content']
