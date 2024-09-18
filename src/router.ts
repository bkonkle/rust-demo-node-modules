import Router from '@koa/router'
import type {Context} from 'koa'
import * as ort from 'onnxruntime-node'
import {Tokenizer} from 'tokenizers'

export async function initRouter(): Promise<Router> {
  const router = new Router()
    .get('/me', getUser)
    .post('/classify', await classifyText())

  return router
}

export async function getUser(context: Context): Promise<void> {
  context.status = 200
  context.body = context.state['user']
}

export async function classifyText() {
  const session = await ort.InferenceSession.create(
    './lib/text_classification/data/snips-bert/model.onnx'
  )

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
  const tokenizer = Tokenizer.fromFile(
    './lib/text_classification/data/snips-bert/tokenizer.json'
  )

  return async (context: Context): Promise<void> => {
    const data: {text?: string} = context.request.body ?? {}

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const input = await tokenizer.encode(data.text ?? '')

    console.log(`>- input ->`, input)

    context.status = 200
    context.body = 'Hello World'
  }
}
