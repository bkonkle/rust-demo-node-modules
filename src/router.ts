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
  // TODO: Launch Python subprocess

  return async (context: Context): Promise<void> => {
    const data: {text?: string} = context.request.body ?? {}

    // TODO: Send query to Python process

    context.status = 200
    context.body = 'WIP'
  }
}
