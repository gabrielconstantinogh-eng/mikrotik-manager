import { ipcMain } from 'electron'

import { checkEquipmentConnectivity } from '../services/connectivityService'
import { listEquipments } from '../database/equipmentRepository'

const MAX_CONCURRENT_CHECKS = 10

async function runWithConcurrency(items, limit, task) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (true) {
      const index = nextIndex++

      if (index >= items.length) {
        return
      }

      results[index] = await task(items[index])
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker()
  )

  await Promise.all(workers)

  return results
}

export function registerConnectivityHandlers() {
  ipcMain.handle('connectivity:check', (_event, data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Dados para verificação inválidos.')
    }

    return checkEquipmentConnectivity(data.host, data.port)
  })

  ipcMain.handle('connectivity:check-all', async () => {
    const equipments = listEquipments()

    return runWithConcurrency(
      equipments,
      MAX_CONCURRENT_CHECKS,
      async (equipment) => {
        try {
          const result = await checkEquipmentConnectivity(
            equipment.host,
            equipment.port
          )

          return {
            id: equipment.id,
            name: equipment.name,
            ...result
          }
        } catch (error) {
          return {
            id: equipment.id,
            name: equipment.name,
            host: equipment.host,
            checkedAt: new Date().toISOString(),
            error: error.message,
            ping: {
              online: false,
              latencyMs: null
            },
            winbox: {
              port: equipment.port,
              open: false
            }
          }
        }
      }
    )
  })
}
