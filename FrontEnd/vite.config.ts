import { defineConfig } from 'vite'
import type { ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Server-side proxy plugin for ZotGPT API (avoids CORS)
function zotgptProxy() {
  let apiKey: string
  let model: string
  let endpoint: string

  return {
    name: 'zotgpt-proxy',
    configResolved(config: { env: Record<string, string> }) {
      apiKey = config.env.VITE_ZOTGPT_API_KEY || ''
      model = config.env.VITE_ZOTGPT_MODEL || 'gpt-4o'
      endpoint = config.env.VITE_ZOTGPT_ENDPOINT || 'https://azureapi.zotgpt.uci.edu'
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/zotgpt', async (req, res) => {
        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'VITE_ZOTGPT_API_KEY not set' }))
          return
        }

        // Read request body
        const chunks: Buffer[] = []
        for await (const chunk of req) {
          chunks.push(chunk as Buffer)
        }
        const body = Buffer.concat(chunks).toString()

        try {
          const url = `${endpoint}/openai/deployments/${model}/chat/completions?api-version=2024-02-01`
          const upstream = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': apiKey,
            },
            body,
          })

          const data = await upstream.text()
          res.writeHead(upstream.status, { 'Content-Type': 'application/json' })
          res.end(data)
        } catch (err) {
          res.writeHead(502, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), zotgptProxy()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
