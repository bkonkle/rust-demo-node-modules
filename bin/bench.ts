import process from 'node:process'
import os from 'node:os'
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

  const workers = os.cpus().length / 2

  const result = await autocannon({
    url: `http://localhost:${port}`,
    connections: 100,
    duration: 10,
    workers,
    requests: [
      {
        method: 'GET',
        path: '/me',
        headers: {
          Authorization: token, // eslint-disable-line @typescript-eslint/naming-convention
        },
      },
    ],
  })

  console.log(autocannon.printResult(result))
}

if (esMain(import.meta)) {
  await main()
}
