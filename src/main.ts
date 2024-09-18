import process from 'node:process'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import cors from '@koa/cors'
import morgan from 'koa-morgan'
import esMain from 'es-main'
import {initRouter} from './router.js'
import {jwtCheck} from './jwt.js'

export async function main() {
  const app = new Koa()

  const router = await initRouter()

  const port = Number(process.env['PORT'] ?? 3000)

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'cdnjs.cloudflare.com',
          'fonts.googleapis.com',
        ],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: [
          "'self'",
          'data:',
          'online.swagger.io',
          'validator.swagger.io',
        ],
      },
    })
  )

  app.use(cors())

  app.use(morgan('combined'))

  app.use(bodyParser())

  app.use(await jwtCheck())

  app.use(router.routes()).use(router.allowedMethods())

  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

if (esMain(import.meta)) {
  await main()
}
