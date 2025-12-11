<template>
  <v-container class="pa-4 d-flex flex-column align-center">
    <v-progress-circular indeterminate color="primary" class="mb-2"></v-progress-circular>
    <p>Procesando login...</p>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api.js'
import { authStore } from '../services/auth.js'

const router = useRouter()

onMounted(async () => {
  try {
    // Consulta al backend la sesión actual
    const res = await api.get('/users/session', { withCredentials: true })

    if (!res.data.usuario) throw new Error('No hay usuario logueado')

    // Guardar en store
    authStore.setUser(res.data.usuario)

    // Redirigir según rol
    if (res.data.usuario.rol === 'admin') router.replace('/admin')
    else router.replace('/')
  } catch (err) {
    console.error('Login fallido:', err)
    router.replace('/login')
  }
})
</script>
