<template>
  <v-container>
    <h2>Usuarios</h2>

    <!-- Tabla de usuarios -->
    <v-data-table
      :headers="headers"
      :items="usuarios"
      item-key="id"
      class="elevation-1"
      dense
      show-empty
    >
      <template #item.nombre="{ item }">{{ item.nombre }}</template>
      <template #item.correo="{ item }">{{ item.correo }}</template>
      <template #item.rol="{ item }">{{ item.rol }}</template>
      <template #item.estado="{ item }">{{ item.estado }}</template>
      <template #item.fecha="{ item }">{{ item.fecha_registro }}</template>

      <template #item.acciones="{ item }">
        <v-btn color="warning" x-small class="mr-1" v-if="user?.rol==='admin'" @click="abrirModalEditar(item)">Editar</v-btn>
        <v-btn color="error" x-small v-if="user?.rol==='admin'" @click="abrirModalDesactivar(item)">Eliminar</v-btn>
      </template>

      <template #no-data>
        <tr>
          <td :colspan="headers.length" class="text-center">No hay usuarios registrados</td>
        </tr>
      </template>
    </v-data-table>

    <!-- Modal Editar Usuario -->
    <v-dialog v-model="modalEditar" persistent max-width="400px">
      <v-card>
        <v-card-title>Editar Usuario</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Nombre" v-model="usuarioSeleccionado.nombre" disabled></v-text-field>
            <v-text-field label="Correo" v-model="usuarioSeleccionado.correo" disabled></v-text-field>
            <v-select label="Rol" :items="['admin','user']" v-model="usuarioSeleccionado.rol"></v-select>
            
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="modalEditar=false">Cancelar</v-btn>
          <v-btn color="success" @click="guardarUsuario">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Confirmar Desactivar -->
    <v-dialog v-model="modalDesactivar" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar al usuario "<strong>{{ usuarioSeleccionado.nombre }}</strong>"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="modalDesactivar=false">Cancelar</v-btn>
          <v-btn color="error" @click="desactivarUsuario">Eliminar</v-btn>
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

const usuarios = ref([])
const usuarioSeleccionado = ref({})
const modalEditar = ref(false)
const modalDesactivar = ref(false)
const overlaySnackbar = ref({ visible:false, mensaje:'' })

const user = computed(() => authStore.user)

const headers = [
  { text: 'Nombre', value: 'nombre' },
  { text: 'Correo', value: 'correo' },
  { text: 'Rol', value: 'rol' },
  { text: 'Estado', value: 'estado' },
  { text: 'Fecha registro', value: 'fecha' },
  { text: 'Acciones', value: 'acciones', sortable:false }
]

const mostrarOverlay = (mensaje) => {
  overlaySnackbar.value.mensaje = mensaje
  overlaySnackbar.value.visible = true
}

const cargarUsuarios = async () => {
  if (!user.value || user.value.rol!=='admin') return
  try {
    const res = await api.get('/users/')
    usuarios.value = res.data
  } catch (e) { mostrarOverlay(e.response?.data?.error || 'Error al cargar usuarios') }
}

const abrirModalEditar = (usuario) => {
  usuarioSeleccionado.value = { ...usuario }
  modalEditar.value = true
}

const guardarUsuario = async () => {
  try {
    await api.put(`/users/${usuarioSeleccionado.value.id}`, { 
      rol: usuarioSeleccionado.value.rol, 
      estado: usuarioSeleccionado.value.estado 
    })
    modalEditar.value = false
    mostrarOverlay('Usuario actualizado correctamente')
    cargarUsuarios()
  } catch (e) {
    mostrarOverlay(e.response?.data?.error || 'Error al actualizar usuario')
  }
}

const abrirModalDesactivar = (usuario) => {
  usuarioSeleccionado.value = { ...usuario }
  modalDesactivar.value = true
}

const desactivarUsuario = async () => {
  try {
    await api.delete(`/users/${usuarioSeleccionado.value.id}`)
    modalDesactivar.value = false
    mostrarOverlay('Usuario eliminado correctamente')
    cargarUsuarios()
  } catch (e) {
    mostrarOverlay(e.response?.data?.error || 'Error al desactivar usuario')
  }
}

onMounted(() => {
  cargarUsuarios()
})
</script>

<style scoped>
.v-btn.x-small { font-size:0.7rem; min-width:60px; }
</style>
