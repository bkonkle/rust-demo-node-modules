import process from 'node:process'
import esMain from 'es-main'

type DeviceCodeResponse = {
  device_code?: string
  user_code?: string
  verification_uri?: string
  verification_uri_complete?: string
  expires_in?: number
  interval?: number
}

type TokenResponse = {
  access_token?: string
  id_token?: string
  refresh_token?: string
  scope?: string
  expires_in?: number
  token_type?: string
}

type ErrorResponse = {
  error?: string
  error_description?: string
}

export async function main() {
  const clientId = process.env['AUTH_CLIENT_ID']
  if (!clientId) {
    throw new Error('Missing AUTH_CLIENT_ID')
  }

  const authUrl = process.env['AUTH_URL']
  if (!authUrl) {
    throw new Error('Missing AUTH_URL')
  }

  const audience = process.env['AUTH_AUDIENCE'] ?? 'localhost'

  const deviceCodeUrl = `${authUrl}/oauth/device/code`

  const response = await fetch(deviceCodeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId, // eslint-disable-line @typescript-eslint/naming-convention
      scope: 'openid profile email',
      audience,
    }),
  })

  if (response.status !== 200) {
    throw new Error(
      `Unable to obtain device_code: [${
        response.status
      }] ${await response.text()}`
    )
  }

  const deviceCodeResponse = (await response.json()) as DeviceCodeResponse

  if (!deviceCodeResponse.device_code) {
    throw new Error('Issuer response missing device_code')
  }

  if (!deviceCodeResponse.interval) {
    throw new Error('Issuer response missing interval')
  }

  console.log(
    `Please visit the following URL to login: ${deviceCodeResponse.verification_uri_complete}\n`
  )

  console.log(
    `Verify that the following code is shown: ${deviceCodeResponse.user_code}\n`
  )

  const token = await getToken(
    clientId,
    authUrl,
    deviceCodeResponse.device_code,
    deviceCodeResponse.interval
  )

  console.log('Login successful!\n')

  console.log(`Token:`, JSON.stringify(token, null, 2))
}

/* eslint-disable no-await-in-loop, @typescript-eslint/naming-convention */
async function getToken(
  clientId: string,
  authUrl: string,
  deviceCode: string,
  interval: number
): Promise<TokenResponse> {
  const tokenUrl = `${authUrl}/oauth/token`

  // Loop until the user has authorized the device
  for (;;) {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    })

    if (response.status === 403) {
      const errorResponse = (await response.json()) as ErrorResponse

      if (errorResponse.error !== 'authorization_pending') {
        throw new Error(
          `Unable to obtain token: ${errorResponse.error_description}`
        )
      }
    } else {
      const tokenResponse = (await response.json()) as TokenResponse

      if (tokenResponse.access_token) {
        return tokenResponse
      }

      await new Promise((resolve) => {
        setTimeout(resolve, interval * 1000)
      })
    }
  }
}
/* eslint-enable no-await-in-loop, @typescript-eslint/naming-convention */

if (esMain(import.meta)) {
  await main()
}
