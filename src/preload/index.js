import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  equipment: {
    list: () => ipcRenderer.invoke('equipment:list'),

    create: (data) =>
      ipcRenderer.invoke('equipment:create', data),

    update: (id, data) =>
      ipcRenderer.invoke('equipment:update', id, data),

    delete: (id) =>
      ipcRenderer.invoke('equipment:delete', id)
  },

  security: {
    getStatus: () => ipcRenderer.invoke('security:status')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Erro ao disponibilizar APIs:', error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}