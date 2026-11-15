import { ipcMain, safeStorage } from 'electron'

export function registerSecurityHandlers() {
  ipcMain.handle('security:status', () => {
    const available = safeStorage.isEncryptionAvailable()

    const backend = safeStorage.getSelectedStorageBackend()

    const secure =
      available &&
      backend !== 'basic_text' &&
      backend !== 'unknown'

    return {
      available,
      backend,
      secure
    }
  })
}
