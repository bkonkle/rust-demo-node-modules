import process from 'node:process'
import Koa from 'koa'
import jwt from 'koa-jwt'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import cors from '@koa/cors'
import morgan from 'koa-morgan'
import esMain from 'es-main'
import jwksRsa from 'jwks-rsa'
import {initRouter} from './router.js'

export async function main() {
  const app = new Koa()

  const router = initRouter()

  const port = Number(process.env['PORT'] ?? 3000)

  const authUrl = process.env['AUTH_URL']
  if (!authUrl) {
    throw new Error('Missing AUTH_URL')
  }

  const audience = process.env['AUTH_AUDIENCE'] ?? 'localhost'

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

  app.use(
    jwt({
      secret: jwksRsa.koaJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 2,
        jwksUri: `${authUrl}/.well-known/jwks.json`,
      }),
      audience,
      issuer: `${authUrl}/`,
      algorithms: ['RS256'],
    })
  )

  app.use(router.routes()).use(router.allowedMethods())

  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

if (esMain(import.meta)) {
  await main()
}
