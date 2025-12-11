import { reactive } from 'vue'
import apiClient from '../services/api'   // <-- IMPORTANTE

export const authStore = reactive({
  user: JSON.parse(sessionStorage.getItem('user') || "null"),

  async fetchUser() {
    try {
      const res = await apiClient.get('/users/session')
      const usuario = res.data.usuario

      this.user = usuario
      if (usuario) {
        sessionStorage.setItem('user', JSON.stringify(usuario))
      } else {
        sessionStorage.removeItem('user')
      }

    } catch (err) {
      console.error('Error al cargar usuario', err)
      this.user = null
      sessionStorage.removeItem('user')
    }
  },

  setUser(u) {
    this.user = u
    sessionStorage.setItem('user', JSON.stringify(u))
  },

  logout() {
    this.user = null
    sessionStorage.removeItem('user')
    apiClient.get('/users/logout')
  }
})
