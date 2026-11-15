import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'

let db

export function initializeDatabase() {
  // Diretório de dados da aplicação
  const userDataPath = app.getPath('userData')

  // Garante que o diretório exista
  mkdirSync(userDataPath, { recursive: true })

  // Caminho completo do banco
  const databasePath = join(userDataPath, 'mikrotik-manager.sqlite')

  // Abre ou cria o banco
  db = new Database(databasePath)

  // Configurações do SQLite
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Criação inicial das tabelas
  db.exec(`
    CREATE TABLE IF NOT EXISTS equipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      host TEXT NOT NULL,
      port INTEGER NOT NULL DEFAULT 8291,
      username TEXT NOT NULL,
      description TEXT DEFAULT '',
      favorite INTEGER NOT NULL DEFAULT 0,
      password_encrypted BLOB,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  console.log('Banco de dados inicializado:', databasePath)

  return db
}

export function getDatabase() {
  if (!db) {
    throw new Error('Banco de dados ainda não foi inicializado.')
  }

  return db
}