import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

function runExportMiddleware() {
  return {
    name: 'run-export-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/run-export', (req, res, next) => {
        if (req.method !== 'POST') return next()

        const pythonBin = process.env.PYTHON_BIN || 'python3'
        const scriptPath = resolve(__dirname, 'python', 'export_data.py')
        const outputPath = resolve(__dirname, 'data', 'activities.json')

        const child = spawn(pythonBin, [scriptPath, '--out', outputPath], {
          stdio: ['ignore', 'pipe', 'pipe'],
        })

        let stdout = ''
        let stderr = ''

        child.stdout.on('data', (chunk) => {
          stdout += chunk
        })

        child.stderr.on('data', (chunk) => {
          stderr += chunk
        })

        child.on('close', (code) => {
          if (code === 0) {
            res.statusCode = 200
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ status: 'ok', stdout }))
          } else {
            res.statusCode = 500
            res.setHeader('content-type', 'application/json')
            res.end(
              JSON.stringify({
                status: 'error',
                code,
                stderr,
              }),
            )
          }
        })

        child.on('error', (err) => {
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(
            JSON.stringify({
              status: 'error',
              error: err.message,
            }),
          )
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), runExportMiddleware()],
})
