import { execFile } from 'child_process'
import net from 'net'

const PING_TIMEOUT_MS = 2000
const TCP_TIMEOUT_MS = 1500

function pingHost(host) {
  return new Promise((resolve) => {
    const platform = process.platform

    let args

    if (platform === 'win32') {
      args = ['-n', '1', '-w', String(PING_TIMEOUT_MS), host]
    } else if (platform === 'darwin') {
      args = ['-c', '1', '-W', String(PING_TIMEOUT_MS), host]
    } else {
      args = ['-c', '1', '-W', '2', host]
    }

    const startedAt = Date.now()

    execFile(
      'ping',
      args,
      { timeout: PING_TIMEOUT_MS + 1000, windowsHide: true },
      (error, stdout = '', stderr = '') => {
        const output = `${stdout} ${stderr}`

        if (error) {
          resolve({
            online: false,
            latencyMs: null
          })
          return
        }

        const match = output.match(
          /(?:time|tempo)[=<]\s*([\d.,]+)\s*ms/i
        )

        const parsedLatency = match
          ? Number(match[1].replace(',', '.'))
          : Date.now() - startedAt

        resolve({
          online: true,
          latencyMs: Number.isFinite(parsedLatency)
            ? parsedLatency
            : null
        })
      }
    )
  })
}

function checkTcpPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let finished = false

    function finish(open) {
      if (finished) return

      finished = true
      socket.destroy()
      resolve(open)
    }

    socket.setTimeout(TCP_TIMEOUT_MS)

    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))

    socket.connect(port, host)
  })
}

export async function checkEquipmentConnectivity(host, port = 8291) {
  if (typeof host !== 'string' || !host.trim()) {
    throw new Error('Endereço do equipamento inválido.')
  }

  const numericPort = Number(port)

  if (
    !Number.isInteger(numericPort) ||
    numericPort < 1 ||
    numericPort > 65535
  ) {
    throw new Error('Porta TCP inválida.')
  }

  const normalizedHost = host.trim()

  const [ping, winboxOpen] = await Promise.all([
    pingHost(normalizedHost),
    checkTcpPort(normalizedHost, numericPort)
  ])

  return {
    host: normalizedHost,
    checkedAt: new Date().toISOString(),
    ping,
    winbox: {
      port: numericPort,
      open: winboxOpen
    }
  }
}
