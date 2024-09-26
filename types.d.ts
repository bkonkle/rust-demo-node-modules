/* eslint-disable import/no-unassigned-import, @typescript-eslint/consistent-type-definitions */
import 'autocannon'

declare module 'autocannon' {
  interface Request {
    // Add your custom property here
    setupRequest?: string
  }
}
