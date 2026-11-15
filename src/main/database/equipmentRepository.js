import { getDatabase } from './connection'

function validateEquipment(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Dados do equipamento inválidos.')
  }

  const name = String(data.name ?? '').trim()
  const host = String(data.host ?? '').trim()
  const username = String(data.username ?? '').trim()
  const description = String(data.description ?? '').trim()
  const port = Number(data.port ?? 8291)

  if (!name) throw new Error('Informe o nome do equipamento.')
  if (!host) throw new Error('Informe o endereço IP ou hostname.')
  if (!username) throw new Error('Informe o usuário.')
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('A porta deve ser um número entre 1 e 65535.')
  }

  return {
    name,
    host,
    port,
    username,
    description,
    favorite: data.favorite ? 1 : 0
  }
}

export function listEquipments() {
  const db = getDatabase()

  return db.prepare(`
    SELECT id, name, host, port, username,
           description, favorite, created_at, updated_at
    FROM equipments
    ORDER BY favorite DESC, name COLLATE NOCASE ASC
  `).all()
}

export function createEquipment(data) {
  const db = getDatabase()
  const equipment = validateEquipment(data)

  const result = db.prepare(`
    INSERT INTO equipments
      (name, host, port, username, description, favorite)
    VALUES
      (@name, @host, @port, @username, @description, @favorite)
  `).run(equipment)

  return db.prepare(`
    SELECT id, name, host, port, username,
           description, favorite, created_at, updated_at
    FROM equipments
    WHERE id = ?
  `).get(result.lastInsertRowid)
}

export function updateEquipment(id, data) {
  const db = getDatabase()
  const equipment = validateEquipment(data)

  const result = db.prepare(`
    UPDATE equipments
    SET name = @name,
        host = @host,
        port = @port,
        username = @username,
        description = @description,
        favorite = @favorite,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `).run({ ...equipment, id })

  if (result.changes === 0) return null

  return db.prepare(`
    SELECT id, name, host, port, username,
           description, favorite, created_at, updated_at
    FROM equipments
    WHERE id = ?
  `).get(id)
}

export function deleteEquipment(id) {
  const db = getDatabase()

  const result = db.prepare(
    'DELETE FROM equipments WHERE id = ?'
  ).run(id)

  return result.changes > 0
}