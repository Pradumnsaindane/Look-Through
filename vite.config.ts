import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

type DevRequest = {
  url?: string
  method?: string
  headers: Record<string, string | string[] | undefined>
  on(event: 'data', callback: (chunk: Buffer) => void): void
  on(event: 'end', callback: () => void): void
  on(event: 'error', callback: () => void): void
}

type DevResponse = {
  statusCode: number
  setHeader(name: string, value: string): void
  end(chunk?: string): void
}

type ApiRequest = {
  method?: string
  query?: Record<string, string | string[] | undefined>
  body?: unknown
  headers?: Record<string, string | string[] | undefined>
}

/**
 * Dev-only bridge: production serves `api/*.ts` as serverless functions (see vercel.json),
 * which the Vite dev server does not. This middleware loads the matching handler through
 * Vite's SSR module runner so local development hits the same code the deployment runs.
 */
function apiDevBridge(): Plugin {
  return {
    name: 'look-through-api-dev-bridge',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((rawRequest, rawResponse, next) => {
        const req = rawRequest as unknown as DevRequest
        const res = rawResponse as unknown as DevResponse
        const url = (req.url ?? '').split('?')[0]
        if (!url.startsWith('/api/')) return next()
        const name = url.slice('/api/'.length).replace(/[^a-zA-Z0-9_-]/g, '')
        if (!name) return next()

        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('error', () => next())
        req.on('end', async () => {
          const raw = Buffer.concat(chunks).toString('utf8')
          let body: unknown = raw
          if (raw) {
            try {
              body = JSON.parse(raw)
            } catch {
              body = raw
            }
          }

          const search = new URL(req.url ?? '/', 'http://localhost').searchParams
          const query: Record<string, string | string[]> = {}
          for (const key of new Set(search.keys())) {
            const values = search.getAll(key)
            query[key] = values.length > 1 ? values : values[0]
          }

          const apiRequest: ApiRequest = {
            method: req.method,
            query,
            body,
            headers: req.headers as Record<string, string | string[] | undefined>,
          }

          let statusCode = 200
          let payload: unknown
          const apiResponse = {
            status(code: number) {
              statusCode = code
              return apiResponse
            },
            json(body: unknown) {
              payload = body
              return apiResponse
            },
            setHeader(name: string, value: string) {
              res.setHeader(name, value)
            },
          }

          try {
            const module = await server.ssrLoadModule(`/api/${name}.ts`)
            if (typeof module.default !== 'function') return next()
            await module.default(apiRequest, apiResponse)
            if (payload === undefined) return next()
            res.statusCode = statusCode
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(payload))
          } catch (error) {
            console.error(`[api-dev] /api/${name} failed`, error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ ok: false, error: { code: 'DEV_API_ERROR', message: 'The development API handler failed.' } }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevBridge()],
})
