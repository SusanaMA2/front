<template>
  <v-container>
    <h2>Eventos</h2>

    <!-- Crear evento (solo admin) -->
    <v-form v-if="user?.rol === 'admin'" @submit.prevent="crearEvento" class="mb-4">

      <v-text-field label="Título" v-model="nuevo.titulo" required></v-text-field>
      <v-textarea label="Descripción" v-model="nuevo.descripcion" required></v-textarea>

      <v-text-field
        label="Fecha del evento (YYYY-MM-DD HH:MM:SS)"
        v-model="nuevo.fecha_evento"
        required
      ></v-text-field>

      <v-text-field label="Ubicación" v-model="nuevo.ubicacion"></v-text-field>

      <v-text-field
        label="Cupos"
        v-model="nuevo.cupos"
        type="number"
        min="1"
      ></v-text-field>

      <v-btn type="submit" color="success" small>Crear Evento</v-btn>
    </v-form>

    <!-- Tabla -->
    <v-data-table
      :headers="headers"
      :items="eventos"
      item-key="id"
      dense
      show-empty
      class="elevation-1"
    >
      <!-- Título -->
      <template #item.titulo="{ item }">
        <span v-if="item.titulo.length > 25" :title="item.titulo">
          {{ item.titulo.slice(0, 25) }}...
        </span>
        <span v-else>{{ item.titulo }}</span>
      </template>

      <!-- Descripción -->
      <template #item.descripcion="{ item }">
        <span v-if="item.descripcion.length > 40" :title="item.descripcion">
          {{ item.descripcion.slice(0, 40) }}...
        </span>
        <span v-else>{{ item.descripcion }}</span>
      </template>

      <!-- Fecha -->
      <template #item.fecha_evento="{ item }">
        {{ item.fecha_evento.slice(0, 16) }}
      </template>

      <!-- Activo -->
      <template #item.activo="{ item }">
        <v-chip :color="item.activo ? 'green' : 'red'" small dark>
          {{ item.activo ? "Sí" : "No" }}
        </v-chip>
      </template>

      <!-- Acciones -->
      <template #item.acciones="{ item }">
        <v-btn
          v-if="user?.rol === 'admin'"
          color="warning"
          x-small
          class="mr-1"
          @click="abrirModalEditar(item)"
        >
          Editar
        </v-btn>

        <v-btn
          v-if="user?.rol === 'admin'"
          color="error"
          x-small
          class="mr-1"
          @click="abrirModalEliminar(item)"
        >
          Eliminar
        </v-btn>

        <v-btn
          v-if="user"
          color="primary"
          x-small
          @click="inscribirse(item.id)"
        >
          Inscribirse
        </v-btn>
      </template>

      <template #no-data>
        <tr><td :colspan="headers.length" class="text-center">No hay eventos registrados</td></tr>
      </template>
    </v-data-table>

    <!-- Modal Editar -->
    <v-dialog v-model="modalEditar" persistent max-width="600px">
      <v-card>
        <v-card-title>Editar Evento</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Título" v-model="eventoSel.titulo"></v-text-field>
            <v-textarea label="Descripción" v-model="eventoSel.descripcion"></v-textarea>

            <v-text-field
              label="Fecha del evento (YYYY-MM-DD HH:MM:SS)"
              v-model="eventoSel.fecha_evento"
              required
            ></v-text-field>

            <v-text-field label="Ubicación" v-model="eventoSel.ubicacion"></v-text-field>
            <v-text-field label="Cupos" type="number" v-model="eventoSel.cupos"></v-text-field>

            <v-switch label="Activo" v-model="eventoSel.activo"></v-switch>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="modalEditar = false">Cancelar</v-btn>
          <v-btn color="success" @click="guardarEditar">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmar eliminar -->
    <v-dialog v-model="modalEliminar" max-width="400px">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>

        <v-card-text>
          ¿Eliminar el evento <strong>{{ eventoSel.titulo }}</strong>?
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="modalEliminar = false">Cancelar</v-btn>
          <v-btn color="error" @click="confirmarEliminar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar overlay -->
    <v-snackbar
      v-model="overlay.visible"
      :timeout="2500"
      absolute
      top
      color="black"
      elevation="10"
    >
      <span style="color:white">{{ overlay.text }}</span>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../services/api.js";
import { authStore } from "../services/auth.js";

const user = computed(() => authStore.user);

const eventos = ref([]);

const nuevo = ref({
  titulo: "",
  descripcion: "",
  fecha_evento: "",
  ubicacion: "",
  cupos: "",
});

const headers = [
  { text: "Título", value: "titulo" },
  { text: "Descripción", value: "descripcion" },
  { text: "Fecha", value: "fecha_evento" },
  { text: "Ubicación", value: "ubicacion" },
  { text: "Cupos", value: "cupos" },
  { text: "Activo", value: "activo" },
  { text: "Acciones", value: "acciones", sortable: false },
];

const modalEditar = ref(false);
const modalEliminar = ref(false);
const eventoSel = ref({});

const overlay = ref({ visible: false, text: "" });
const showOverlay = (msg) => {
  overlay.value.text = msg;
  overlay.value.visible = true;
};

// Cargar eventos
const cargarEventos = async () => {
  try {
    const res = await api.get("/events/", { withCredentials: true });
    eventos.value = res.data;
  } catch {
    showOverlay("Error cargando eventos");
  }
};

// Crear evento
const crearEvento = async () => {
  try {
    await api.post("/events/", nuevo.value, { withCredentials: true });
    showOverlay("Evento creado");
    cargarEventos();
    nuevo.value = { titulo: "", descripcion: "", fecha_evento: "", ubicacion: "", cupos: "" };
  } catch (e) {
    showOverlay(e.response?.data?.error || "Error al crear evento");
  }
};

// Abrir modal editar
const abrirModalEditar = (ev) => {
  eventoSel.value = { ...ev };
  modalEditar.value = true;
};

// Guardar edición
const guardarEditar = async () => {
  try {
    await api.put(`/events/${eventoSel.value.id}`, eventoSel.value, { withCredentials: true });
    showOverlay("Evento actualizado");
    modalEditar.value = false;
    cargarEventos();
  } catch {
    showOverlay("Error al actualizar");
  }
};

// Abrir modal eliminar
const abrirModalEliminar = (ev) => {
  eventoSel.value = { ...ev };
  modalEliminar.value = true;
};

// Confirmar eliminar
const confirmarEliminar = async () => {
  try {
    await api.delete(`/events/${eventoSel.value.id}`, { withCredentials: true });
    showOverlay("Evento eliminado");
    modalEliminar.value = false;
    cargarEventos();
  } catch {
    showOverlay("Error al eliminar");
  }
};

// Inscribirse
const inscribirse = async (id) => {
  try {
    await api.post(`/events/${id}/inscribirse`, {}, { withCredentials: true });
    showOverlay("Inscripción exitosa");
  } catch (e) {
    showOverlay(e.response?.data?.error || "Error al inscribirse");
  }
};

onMounted(cargarEventos);
</script>

<style scoped>
.v-btn.x-small {
  font-size: 0.7rem;
  min-width: 60px;
}
</style>
