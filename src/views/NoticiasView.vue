<template>
  <v-container>
    <h2>Noticias</h2>

    <!-- Crear noticia solo admin -->
    <v-form v-if="user?.rol === 'admin'" @submit.prevent="crearNoticia" class="mb-4">
      <v-text-field label="Título" v-model="nuevo.titulo" required></v-text-field>
      <v-textarea label="Contenido" v-model="nuevo.contenido" required></v-textarea>
      <v-select label="Tipo" :items="['informativa','evento']" v-model="nuevo.tipo"></v-select>

      <!-- Evento ID visible solo si tipo = 'evento' -->
      <v-text-field 
        v-if="nuevo.tipo === 'evento'" 
        label="Evento relacionado (ID)" 
        v-model="nuevo.evento_id">
      </v-text-field>

      <v-btn color="success" type="submit" small>Crear Noticia</v-btn>
    </v-form>

    <!-- Tabla de noticias -->
    <v-data-table
      :headers="headers"
      :items="noticias"
      item-key="id"
      class="elevation-1"
      dense
      show-empty
    >
      <template #item.titulo="{ item }">
        <span v-if="item.titulo.length > 30" :title="item.titulo">{{ item.titulo.slice(0,30) }}...</span>
        <span v-else>{{ item.titulo }}</span>
      </template>

      <template #item.contenido="{ item }">
        <span v-if="item.contenido.length > 50" :title="item.contenido">{{ item.contenido.slice(0,50) }}...</span>
        <span v-else>{{ item.contenido }}</span>
      </template>

      <template #item.tipo="{ item }">
        <span v-if="item.tipo.length > 15" :title="item.tipo">{{ item.tipo.slice(0,15) }}...</span>
        <span v-else>{{ item.tipo }}</span>
      </template>

      <template #item.acciones="{ item }">
        <v-btn color="warning" x-small class="mr-1" v-if="user?.rol==='admin'" @click="abrirModalEditar(item)">Editar</v-btn>
        <v-btn color="error" x-small class="mr-1" v-if="user?.rol==='admin'" @click="abrirModalEliminar(item)">Eliminar</v-btn>
        <v-btn color="primary" x-small v-if="user" @click="comentar(item.id)">Comentar</v-btn>
      </template>

      <template #no-data>
        <tr>
          <td :colspan="headers.length" class="text-center">No hay noticias registradas</td>
        </tr>
      </template>
    </v-data-table>

    <!-- Modal Editar Noticia -->
    <v-dialog v-model="modalEditar" persistent max-width="600px">
      <v-card>
        <v-card-title>Editar Noticia</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Título" v-model="noticiaSeleccionada.titulo" required></v-text-field>
            <v-textarea label="Contenido" v-model="noticiaSeleccionada.contenido" required></v-textarea>
            <v-select label="Tipo" :items="['informativa','evento']" v-model="noticiaSeleccionada.tipo"></v-select>

            <!-- Evento ID visible solo si tipo = 'evento' -->
            <v-text-field 
              v-if="noticiaSeleccionada.tipo === 'evento'" 
              label="Evento relacionado (ID)" 
              v-model="noticiaSeleccionada.evento_id">
            </v-text-field>

          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="modalEditar=false">Cancelar</v-btn>
          <v-btn color="success" @click="guardarEditar">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Confirmar Eliminar -->
    <v-dialog v-model="modalEliminar" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar la noticia "<strong>{{ noticiaSeleccionada.titulo }}</strong>"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="modalEliminar=false">Cancelar</v-btn>
          <v-btn color="error" @click="confirmarEliminar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Overlay Snackbar para mensajes -->
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
import { ref, computed, onMounted } from 'vue'
import api from '../services/api.js'
import { authStore } from '../services/auth.js'

const noticias = ref([])
const nuevo = ref({ titulo:'', contenido:'', tipo:'informativa', evento_id:'' })
const user = computed(() => authStore.user)

const headers = [
  { text: 'Título', value: 'titulo' },
  { text: 'Contenido', value: 'contenido' },
  { text: 'Tipo', value: 'tipo' },
  { text: 'Acciones', value: 'acciones', sortable:false }
]

// Modal
const modalEditar = ref(false)
const modalEliminar = ref(false)
const noticiaSeleccionada = ref({})

// Overlay Snackbar
const overlaySnackbar = ref({ visible:false, mensaje:'' })
const mostrarOverlay = (mensaje) => {
  overlaySnackbar.value.mensaje = mensaje
  overlaySnackbar.value.visible = true
}

// ------------------ Cargar noticias ------------------
const cargarNoticias = async () => {
  try{
    const res = await api.get('/news/noticias', {withCredentials:true})
    noticias.value = res.data
  }catch(e){ mostrarOverlay('Error cargando noticias') }
}

// ------------------ Crear noticia ------------------
const crearNoticia = async () => {
  if(!user.value || user.value.rol!=='admin') return mostrarOverlay('No tienes permisos')
  try{
    await api.post('/news/noticias', {...nuevo.value, evento_id:nuevo.value.evento_id||null}, {withCredentials:true})
    nuevo.value={ titulo:'', contenido:'', tipo:'informativa', evento_id:'' }
    cargarNoticias()
    mostrarOverlay('Noticia creada correctamente')
  }catch(e){ mostrarOverlay(e.response?.data?.error || 'Error al crear noticia') }
}

// ------------------ Abrir modal Editar ------------------
const abrirModalEditar = (noticia) => {
  noticiaSeleccionada.value = {...noticia} // clonar datos
  modalEditar.value = true
}

// ------------------ Guardar cambios ------------------
const guardarEditar = async () => {
  try{
    await api.put(`/news/noticias/${noticiaSeleccionada.value.id}`, noticiaSeleccionada.value, {withCredentials:true})
    modalEditar.value=false
    cargarNoticias()
    mostrarOverlay('Noticia actualizada correctamente')
  }catch(e){ mostrarOverlay('Error al actualizar noticia') }
}

// ------------------ Abrir modal Eliminar ------------------
const abrirModalEliminar = (noticia) => {
  noticiaSeleccionada.value = {...noticia}
  modalEliminar.value = true
}

// ------------------ Confirmar eliminación ------------------
const confirmarEliminar = async () => {
  try{
    await api.delete(`/news/noticias/${noticiaSeleccionada.value.id}`, {withCredentials:true})
    modalEliminar.value=false
    cargarNoticias()
    mostrarOverlay('Noticia eliminada correctamente')
  }catch(e){ mostrarOverlay('Error al eliminar noticia') }
}

// ------------------ Comentar noticia ------------------
const comentar = async (id) => {
  const texto = prompt("Escribe tu comentario")
  if(!texto) return
  try{
    await api.post(`/news/noticias/${id}/comentarios`, {texto}, {withCredentials:true})
    mostrarOverlay('Comentario agregado correctamente')
  }catch(e){ mostrarOverlay('Error al agregar comentario') }
}

onMounted(cargarNoticias)
</script>

<style scoped>
.v-btn.x-small { font-size:0.7rem; min-width:60px; }
</style>
