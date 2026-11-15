import { ipcMain } from 'electron'

import {
  listEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment
} from '../database/equipmentRepository'

export function registerEquipmentHandlers() {
  ipcMain.handle('equipment:list', () => {
    return listEquipments()
  })

  ipcMain.handle('equipment:create', (_event, data) => {
    return createEquipment(data)
  })

  ipcMain.handle('equipment:update', (_event, id, data) => {
    return updateEquipment(id, data)
  })

  ipcMain.handle('equipment:delete', (_event, id) => {
    return deleteEquipment(id)
  })
}