/* eslint-disable capitalized-comments */
import process from 'node:process'
// import path from 'node:path'
import type {Context} from 'koa'
import {interpreter as py} from 'node-calls-python'
// import {Inference} from '../lib/text_classification_rs/index.js'

export async function classifyText() {
  const useRustModule = process.env['USE_RUST_MODULE'] === 'true'
  if (useRustModule) {
    console.log('Using the Rust Module for Text Classification\n')

    return classifyTextWithRust()
  }

  return classifyTextWithPython()
}

export async function classifyTextWithPython() {
  const libraryPath = './lib/text_classification'
  const modelPath = `${libraryPath}/data/snips-bert`

  const pyModule = await py.import(
    `${libraryPath}/src/text_classification/inference.py`,
    false
  )
  const inference = await py.create(pyModule, 'Inference', modelPath)

  return async (context: Context): Promise<void> => {
    const data: {text?: string} = context.request.body ?? {}

    if (!data.text) {
      context.status = 400
      context.body = 'Missing text in request body'

      return
    }

    const result = await py.call(inference, 'infer', data.text)

    context.status = 200
    context.body = result as string
  }
}

export async function classifyTextWithRust() {
  console.log(`>- dodododo ->`)

  // const inference = Inference.fromDataDir(
  //   path.resolve('./lib/text_classification/data')
  // )

  return async (context: Context): Promise<void> => {
    const data: {text?: string} = context.request.body ?? {}

    if (!data.text) {
      context.status = 400
      context.body = 'Missing text in request body'

      return
    }

    // const response = inference.infer(data.text)

    context.status = 200
    // context.body = response
  }
}
