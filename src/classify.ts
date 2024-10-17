import path from 'node:path'
import process from 'node:process'
import type {Context} from 'koa'
import {python} from 'pythonia'
import {Inference} from '../lib/text_classification_rs/index.js'

export async function classifyText() {
  const useRustModule = process.env['USE_RUST_MODULE'] === 'true'

  if (useRustModule) {
    console.log('Using the Rust Module for JWT verification\n')

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

  const inferenceModule = (await python(
    'text_classification.inference'
  )) as PyInferenceModule

  const inference = await inferenceModule.init('./lib/text_classification/data')

  return async (context: Context): Promise<void> => {
    const data: {text?: string} = context.request.body ?? {}

    if (!data.text) {
      context.status = 400
      context.body = 'Missing text in request body'

      return
    }

    const response = await inference.infer(data.text)

    context.status = 200
    context.body = response
  }
}

type PyInferenceModule = {
  init: (dataDirectory: string) => Promise<PyInference>
}

type PyInference = {
  infer(input: string): Promise<string>
}
