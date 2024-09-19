import process from 'node:process'
import path from 'node:path'
import {type ChildProcessWithoutNullStreams, spawn} from 'node:child_process'
import type {Context} from 'koa'
import {Inference} from '../lib/text_classification_rs/index.js'

export async function classifyText() {
  const useRustModule = process.env['USE_RUST_MODULE'] === 'true'
  if (useRustModule) {
    console.log('Using the Rust Module for JWT verification\n')

    return classifyTextWithRust()
  }

  return classifyTextWithPython()
}

export async function classifyTextWithPython() {
  const infer = spawn('python', ['-u', '-i', 'scripts/run_infer.py'], {
    cwd: 'lib/text_classification',
  })

  infer.stdout.on('data', (data: Uint16Array) => {
    console.log(`Python stdout: ${data.toString()}`)
  })

  infer.stderr.on('data', (data: Uint16Array) => {
    console.error(`Python stderr: ${data.toString()}`)
  })

  return async (context: Context): Promise<void> => {
    const data: {text?: string} = context.request.body ?? {}

    if (!data.text) {
      context.status = 400
      context.body = 'Missing text in request body'

      return
    }

    const response = await sendToPython(infer, data.text)

    context.status = 200
    context.body = response
  }
}

async function sendToPython(
  infer: ChildProcessWithoutNullStreams,
  input: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Send input to Python process
    infer.stdin.write(`${input}\n`)

    // Listen for Python's response
    infer.stdout.once('data', (data: Uint16Array) => {
      resolve(data.toString().trim())
    })

    // Handle errors
    infer.stderr.once('data', (data: Uint16Array) => {
      reject(new Error(data.toString().trim()))
    })
  })
}

export async function classifyTextWithRust() {
  const inference = Inference.fromDataDir(
    path.resolve('./lib/text_classification/data')
  )

  return async (context: Context): Promise<void> => {
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
