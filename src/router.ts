import Router from '@koa/router'
import type {Context} from 'koa'

export function initRouter(): Router {
  const router = new Router()

  router.get('/me', getUser)

  return router
}

export async function getUser(context: Context): Promise<void> {
  console.log(`>- context ->`, context)

  context.status = 200
}
