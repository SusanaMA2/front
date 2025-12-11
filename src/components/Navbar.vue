<template>
  <v-app-bar color="primary" dark>
    <v-toolbar-title>Mi Sistema Deportivo</v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- Botones de navegación -->
    <v-btn text to="/eventos">Eventos</v-btn>
    <v-btn text to="/noticias">Noticias</v-btn>
    <v-btn text to="/videos">Videos</v-btn>
    <v-btn text to="/imagenes">Imagenes</v-btn>
    <v-btn text to="/usuarios">Usuarios</v-btn>


    <!-- Usuario al final con menú desplegable debajo -->
    <template v-if="usuario">
      <v-divider vertical class="mx-2"></v-divider>

      <v-menu offset-y bottom>
        <template #activator="{ props }">
          <v-btn v-bind="props" text class="d-flex align-center">
            <v-avatar class="user-avatar mr-2" size="40" color="deep-purple accent-4">
              <span class="white--text">{{ usuarioIniciales }}</span>
            </v-avatar>
            {{ usuario.nombre }}
            <v-icon right>mdi-menu-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="logout">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Cerrar sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <!-- Si no hay usuario -->
    <template v-else>
      <v-divider vertical class="mx-2"></v-divider>
      <v-btn text to="/login">Login</v-btn>
    </template>
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const usuario = ref(null)
const router = useRouter()

const usuarioIniciales = computed(() => {
  if (!usuario.value?.nombre) return ''
  const nombres = usuario.value.nombre.split(' ')
  return nombres.map(n => n[0]).join('').toUpperCase()
})

const cargarUsuario = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/users/session', { withCredentials: true })
    usuario.value = res.data.usuario
  } catch (err) {
    console.error('Error al cargar usuario', err)
  }
}

const logout = async () => {
  try {
    await axios.get('http://localhost:5000/api/users/logout', { withCredentials: true })
    usuario.value = null
    router.push('/login')
  } catch (err) {
    console.error('Error al cerrar sesión', err)
  }
}

onMounted(() => cargarUsuario())
</script>

<style scoped>
.user-avatar {
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  cursor: default;
  transition: transform 0.2s;
}

.user-avatar:hover {
  transform: scale(1.05);
}
</style>
