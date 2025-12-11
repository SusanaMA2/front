<template>
  <v-container class="d-flex justify-center align-center" style="height: 100vh;">
    <v-card width="400">
      <v-card-title class="justify-center">Iniciar sesión</v-card-title>
      <v-card-text>
        <!-- Login tradicional -->
        <v-form ref="loginForm" v-model="valid">
          <v-text-field
            v-model="correo"
            label="Correo electrónico"
            type="email"
            required
          ></v-text-field>

          <v-text-field
            v-model="contraseña"
            label="Contraseña"
            type="password"
            required
          ></v-text-field>

          <v-btn color="primary" block @click="login">
            Ingresar
          </v-btn>
        </v-form>

        <v-divider class="my-4">O</v-divider>

        <!-- Login con Google -->
        <v-btn color="red darken-1" block @click="loginGoogle">
          Iniciar sesión con Google
        </v-btn>

        <v-alert v-if="error" type="error" class="mt-4">
          {{ error }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api.js'        // Axios preconfigurado con baseURL
import { authStore } from '../services/auth.js'

const correo = ref('')
const contraseña = ref('')
const error = ref('')
const valid = ref(false)
const router = useRouter()

// ------------------ Login tradicional ------------------
const login = async () => {
  error.value = ''
  try {
    const response = await api.post(
      '/users/login',              // backend debe retornar { usuario: {...} }
      { correo: correo.value, contraseña: contraseña.value },
      { withCredentials: true }    // importante para enviar cookies
    )

    if (!response.data.usuario) throw new Error('No se recibió usuario del backend')

    // 🔹 Guardar usuario en store
    authStore.setUser(response.data.usuario)

    // Redirigir según rol
    if (response.data.usuario.rol === 'admin') router.push('/admin')
    else router.push('/')

  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.error || 'Error al iniciar sesión'
  }
}

// ------------------ Login con Google ------------------
const loginGoogle = () => {
  // Redirige al backend que inicia OAuth
  window.location.href = 'http://localhost:5000/api/users/google/login'
}
</script>
