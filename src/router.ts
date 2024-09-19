import {type ChildProcessWithoutNullStreams, spawn} from 'node:child_process'
import Router from '@koa/router'
import type {Context} from 'koa'

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
