import type { Plugin } from 'vite'

/**
 * 代理 GitHub Device Flow OAuth 端点，绕过浏览器 CORS 限制。
 * 仅开发环境使用（localhost）；生产环境需另配 Cloudflare Worker。
 */
export function githubDeviceProxy(): Plugin {
  return {
    name: 'github-device-proxy',
    configureServer(server) {
      server.middlewares.use('/__auth/device/code', (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405)
          res.end()
          return
        }
        readBody(req).then(async (body) => {
          try {
            const upstream = await fetch('https://github.com/login/device/code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body,
            })
            const data = await upstream.json()
            res.writeHead(upstream.status, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(data))
          }
          catch (e: any) {
            res.writeHead(502)
            res.end(JSON.stringify({ error: 'proxy_error', error_description: e.message }))
          }
        })
      })

      server.middlewares.use('/__auth/device/token', (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405)
          res.end()
          return
        }
        readBody(req).then(async (body) => {
          try {
            const upstream = await fetch('https://github.com/login/oauth/access_token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body,
            })
            const data = await upstream.json()
            res.writeHead(upstream.status, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(data))
          }
          catch (e: any) {
            res.writeHead(502)
            res.end(JSON.stringify({ error: 'proxy_error', error_description: e.message }))
          }
        })
      })
    },
  }
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', () => resolve(''))
  })
}
