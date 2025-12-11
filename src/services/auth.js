import { reactive } from 'vue'

export const authStore = reactive({
  user: JSON.parse(sessionStorage.getItem('user') || null),

  setUser(u) {
    this.user = u
    sessionStorage.setItem('user', JSON.stringify(u))
  },

  logout() {
    this.user = null
    sessionStorage.removeItem('user')
  }
})
