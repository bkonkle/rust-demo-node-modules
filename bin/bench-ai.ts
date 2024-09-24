import process from 'node:process'
import path from 'node:path'
import autocannon from 'autocannon'
import esMain from 'es-main'

export async function main() {
  const token = process.env['AUTH_TOKEN']
  if (!token) {
    throw new Error('Missing AUTH_TOKEN')
  }

  if (!token.startsWith('Bearer ')) {
    throw new Error('AUTH_TOKEN must start with "Bearer "')
  }

  const port = Number(process.env['PORT'] ?? 3000)

  console.log(`Running benchmark targeting port ${port}...`)

  const result = await autocannon({
    url: `http://localhost:${port}`,
    connections: 20,
    duration: 10,
    workers: 4,
    requests: [
      {
        method: 'POST',
        path: '/classify',
        headers: {
          Authorization: token, // eslint-disable-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
        },
        setupRequest: path.join(import.meta.dirname, './setup-ai-request'),
      },
    ],
  })

  console.log(autocannon.printResult(result))
}

if (esMain(import.meta)) {
  await main()
}
