import Router from '@koa/router'
import type {Context} from 'koa'
import {classifyText} from './classify.js'

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
