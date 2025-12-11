<template>
  <v-container>
    <h2>Videos</h2>

    <!-- Formulario Crear Video solo admin -->
    <v-form v-if="user?.rol === 'admin'" @submit.prevent="abrirModalCrear" class="mb-4">
      <v-btn color="success" small @click="abrirModalCrear">Agregar Nuevo Video</v-btn>
    </v-form>

    <!-- Tabla de videos -->
    <v-data-table
      :headers="headers"
      :items="videos"
      item-key="id"
      class="elevation-1"
      dense
      show-empty
    >
      <template #item.titulo="{ item }">
        <span v-if="item.titulo.length > 30" :title="item.titulo">{{ item.titulo.slice(0,30) }}...</span>
        <span v-else>{{ item.titulo }}</span>
      </template>

      <template #item.descripcion="{ item }">
        <span v-if="item.descripcion.length > 50" :title="item.descripcion">{{ item.descripcion.slice(0,50) }}...</span>
        <span v-else>{{ item.descripcion }}</span>
      </template>

      <template #item.url="{ item }">
        <a :href="item.url" target="_blank">{{ item.url.length > 30 ? item.url.slice(0,30)+'...' : item.url }}</a>
      </template>

      <template #item.fecha="{ item }">
        {{ item.fecha_subida }}
      </template>

      <template #item.acciones="{ item }">
        <v-btn color="warning" x-small class="mr-1" v-if="user?.rol==='admin'" @click="abrirModalEditar(item)">Editar</v-btn>
        <v-btn color="error" x-small class="mr-1" v-if="user?.rol==='admin'" @click="abrirModalEliminar(item)">Eliminar</v-btn>
      </template>

      <template #no-data>
        <tr>
          <td :colspan="headers.length" class="text-center">No hay videos registrados</td>
        </tr>
      </template>
    </v-data-table>

    <!-- Modal Crear/Editar Video -->
    <v-dialog v-model="modalEditar" persistent max-width="600px">
      <v-card>
        <v-card-title>{{ esCrear ? 'Crear Video' : 'Editar Video' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Título" v-model="videoSeleccionado.titulo" required></v-text-field>
            <v-text-field label="URL" v-model="videoSeleccionado.url" required></v-text-field>
            <v-textarea label="Descripción" v-model="videoSeleccionado.descripcion"></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="modalEditar=false">Cancelar</v-btn>
          <v-btn color="success" @click="guardarVideo">{{ esCrear ? 'Crear' : 'Guardar' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Confirmar Eliminar -->
    <v-dialog v-model="modalEliminar" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar el video "<strong>{{ videoSeleccionado.titulo }}</strong>"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="modalEliminar=false">Cancelar</v-btn>
          <v-btn color="error" @click="confirmarEliminar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar Overlay -->
    <v-snackbar
      v-model="overlaySnackbar.visible"
      :timeout="3000"
      absolute
      top
      color="black"
      elevation="10"
      shaped
    >
      <span style="color:white">{{ overlaySnackbar.mensaje }}</span>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api.js'
import { authStore } from '../services/auth.js'

const videos = ref([])
const videoSeleccionado = ref({ titulo:'', url:'', descripcion:'' })
const modalEditar = ref(false)
const modalEliminar = ref(false)
const esCrear = ref(true)
const overlaySnackbar = ref({ visible:false, mensaje:'' })

const user = computed(() => authStore.user)

const headers = [
  { text: 'Título', value: 'titulo' },
  { text: 'URL', value: 'url' },
  { text: 'Descripción', value: 'descripcion' },
  { text: 'Fecha subida', value: 'fecha' },
  { text: 'Acciones', value: 'acciones', sortable:false }
]

const mostrarOverlay = (mensaje) => {
  overlaySnackbar.value.mensaje = mensaje
  overlaySnackbar.value.visible = true
}

const cargarVideos = async () => {
  try {
    const res = await api.get('/videos/')
    videos.value = res.data
  } catch (e) { mostrarOverlay('Error al cargar videos') }
}

const abrirModalCrear = () => {
  videoSeleccionado.value = { titulo:'', url:'', descripcion:'' }
  esCrear.value = true
  modalEditar.value = true
}

const abrirModalEditar = (video) => {
  videoSeleccionado.value = { ...video }
  esCrear.value = false
  modalEditar.value = true
}

const guardarVideo = async () => {
  try {
    if (esCrear.value) {
      await api.post('/videos/', { ...videoSeleccionado.value })
      mostrarOverlay('Video creado correctamente')
    } else {
      await api.put(`/videos/${videoSeleccionado.value.id}`, { ...videoSeleccionado.value })
      mostrarOverlay('Video actualizado correctamente')
    }
    modalEditar.value = false
    cargarVideos()
  } catch (e) {
    mostrarOverlay(e.response?.data?.error || 'Error al guardar video')
  }
}

const abrirModalEliminar = (video) => {
  videoSeleccionado.value = { ...video }
  modalEliminar.value = true
}

const confirmarEliminar = async () => {
  try {
    await api.delete(`/videos/${videoSeleccionado.value.id}`)
    mostrarOverlay('Video eliminado correctamente')
    modalEliminar.value = false
    cargarVideos()
  } catch (e) {
    mostrarOverlay(e.response?.data?.error || 'Error al eliminar video')
  }
}

onMounted(() => {
  if (!user.value) mostrarOverlay('Inicia sesión para ver videos')
  cargarVideos()
})
</script>

<style scoped>
.v-btn.x-small { font-size:0.7rem; min-width:60px; }
</style>
