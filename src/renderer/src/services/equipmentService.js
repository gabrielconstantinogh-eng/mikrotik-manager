const api = window.api.equipment

export const equipmentService = {
  async list() {
    return api.list()
  },

  async create(data) {
    return api.create(data)
  },

  async update(id, data) {
    return api.update(id, data)
  },

  async delete(id) {
    return api.delete(id)
  }
}
