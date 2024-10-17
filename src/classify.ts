import path from 'node:path'
import type {Context} from 'koa'
import {Inference} from '../lib/text_classification_rs/index.js'

export function classifyText() {
  const inference = Inference.fromDataDir(
    path.resolve('./lib/text_classification/data')
  )

  return (context: Context): void => {
    const data: {text?: string} = context.request.body ?? {}

    if (!data.text) {
      context.status = 400
      context.body = 'Missing text in request body'

      return
    }

    const response = inference.infer(data.text)

    context.status = 200
    context.body = response
  }
}
