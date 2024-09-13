import process from 'node:process'
import {type Middleware} from 'koa'
import jwt from 'koa-jwt'
import jwksRsa from 'jwks-rsa'
import {Authorizer} from '../lib/jwt_rsa/index.js'

export async function jwtCheck(): Promise<Middleware> {
  const authUrl = process.env['AUTH_URL']
  if (!authUrl) {
    throw new Error('Missing AUTH_URL')
  }

  const audience = process.env['AUTH_AUDIENCE'] ?? 'localhost'

  const useRustModule = process.env['USE_RUST_MODULE'] === 'true'
  if (useRustModule) {
    console.log('Using the Rust Module for JWT verification\n')

    const auth = await Authorizer.init(audience, authUrl)

    return async (context, next) => {
      const header = context.header?.authorization ?? ''

      const claims = auth.authorize(header)

      context.state['user'] = claims

      return next()
    }
  }

  return jwt({
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
}
