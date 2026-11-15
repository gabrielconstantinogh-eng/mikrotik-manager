
import { safeStorage } from 'electron'

function ensureSecureStorage() {
  const available = safeStorage.isEncryptionAvailable()
  const backend = safeStorage.getSelectedStorageBackend()

  if (
    !available ||
    backend === 'basic_text' ||
    backend === 'unknown'
  ) {
    throw new Error(
      'Armazenamento seguro indisponível. Não é possível proteger esta credencial.'
    )
  }
}

export function encryptPassword(password) {
  if (typeof password !== 'string') {
    throw new Error('A senha informada é inválida.')
  }

  ensureSecureStorage()

  return safeStorage.encryptString(password)
}

export function decryptPassword(encryptedPassword) {
  if (!encryptedPassword) {
    return ''
  }

  ensureSecureStorage()

  return safeStorage.decryptString(
    Buffer.from(encryptedPassword)
  )
}
