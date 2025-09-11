async function cargarEstadosParaSelectOption() {
  const { data, error } = await supabaseClient
    .from("estado_tb")
    .select("id_estado_pk, descripcion");

  if (error) {
    console.error("Error al cargar estados:", error);
    return;
  }

  // Obtén todos los selects que quieras llenar
  const selectEstadoActividad = document.getElementById("idEstadoActividad");
  const selectActualizarEstadoActividad = document.getElementById("idEstadoActividadActualizar")
  const selectEstadoTiposActividad = document.getElementById("idAgregarEstadoTipoActividad");
  const selectActualizarEstadoTiposActividad = document.getElementById("idActualizarEstadoTipoActividad")



  // Limpia todos los selects y agrega el placeholder
  selectEstadoActividad.innerHTML = '<option value="">Selecciona un estado...</option>';
  selectActualizarEstadoActividad.innerHTML = '<option value="">Selecciona un estado...</option>';
  selectEstadoTiposActividad.innerHTML = '<option value="">Selecciona un estado...</option>';
  selectActualizarEstadoTiposActividad.innerHTML = '<option value="">Selecciona un estado...</option>';



  // Recorremos todos los estados y los agregamos a cada select
  data.forEach((estado) => {
    // Creamos la opción base
    const option = document.createElement("option");
    option.value = estado.id_estado_pk;
    option.textContent = estado.descripcion;

    // Clonamos para cada select, porque un mismo nodo <option> no puede estar en dos lugares a la vez
    selectEstadoActividad.appendChild(option.cloneNode(true));
    selectActualizarEstadoActividad.appendChild(option.cloneNode(true));
    selectEstadoTiposActividad.appendChild(option.cloneNode(true));
    selectActualizarEstadoTiposActividad.appendChild(option.cloneNode(true));

  });
}



async function cargarTiposActividadParaSelectOption() {
  const { data, error } = await supabaseClient
    .from("tipos_actividad_tb")
    .select("id_tipo_actividad_pk, descripcion_actividad");

  if (error) {
    console.error("Error al cargar tipos de actividad:", error);
    return;
  }

  const selectTipoActividadAgregar = document.getElementById("idTipoActividad");
  selectTipoActividadAgregar.innerHTML = '<option value="">Selecciona un tipo de actividad...</option>';
  const selectTipoActividadActualizar = document.getElementById("idTipoActividadActualizar");
  selectTipoActividadActualizar.innerHTML = '<option value="">Selecciona un tipo de actividad...</option>';

  data.forEach((tipo) => {
    const option = document.createElement("option");
    option.value = tipo.id_tipo_actividad_pk;
    option.textContent = tipo.descripcion_actividad;

    selectTipoActividadAgregar.appendChild(option.cloneNode(true));
    selectTipoActividadActualizar.appendChild(option.cloneNode(true));
  });
}


async function obtenerActividades() {
  const { data, error } = await supabaseClient
    .from("actividades_tb")
    .select(`
      id_actividad_pk,
      fecha,
      observaciones,
      id_tipo_actividad_fk,
      id_estado_fk,
      estado_tb!inner(descripcion),
      tipos_actividad_tb!inner(descripcion_actividad)
    `)
    .order("fecha", { ascending: false }); // 👈 ORDENAMOS POR FECHA DESCENDENTE

  if (error) {
    console.error("Error al obtener actividades:", error);
    return;
  }

  const tbody = document.getElementById("actividades-tbody");
  tbody.innerHTML = ""; // Limpiar antes de insertar

  data.forEach((actividad) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${actividad.id_actividad_pk}</td>
      <td>${actividad.fecha}</td>
      <td>${actividad.observaciones}</td>
      <td>${actividad.tipos_actividad_tb.descripcion_actividad}</td>
      <td>${actividad.estado_tb.descripcion}</td>
    `;
    tbody.appendChild(fila);
  });
}



async function agregarActividad(event) {
  event.preventDefault();

  // Obtener valores del formulario
  const idActividad = document.getElementById("idActividad").value.trim();
  const fechaActividad = document.getElementById("fechaActividad").value.trim();
  const observacionesActividad = document.getElementById("observacionesActividad").value.trim();
  const idTipoActividad = document.getElementById("idTipoActividad").value; // ✅ selecciona desde el combo, es decir digamos desde el dropdown
  const idEstadoActividad = document.getElementById("idEstadoActividad").value; // ✅ selecciona desde el combo

  if (!idActividad || !fechaActividad || !observacionesActividad || !idTipoActividad || !idEstadoActividad) {
    alert("Por favor completa todos los campos.");
    return;
  }

  // Insertar nueva actividad
  const { error } = await supabaseClient
    .from("actividades_tb")
    .insert([
      {
        id_actividad_pk: parseInt(idActividad),
        fecha: fechaActividad,
        observaciones: observacionesActividad,
        id_tipo_actividad_fk: parseInt(idTipoActividad),
        id_estado_fk: parseInt(idEstadoActividad),
      }
    ]);

  if (error) {
    console.error("Error al agregar actividad:", error);
    alert("Hubo un problema al agregar la actividad.");
    return;
  }

  alert("Actividad agregada con éxito");
  document.getElementById("formAgregarActividad").reset();
  obtenerActividades();
}


async function actualizarActividad(event) {
  event.preventDefault(); // Evita que el formulario recargue la página

  // Obtener valores del formulario
  const idActividad = document.getElementById("idActividadActualizar").value.trim();
  const fechaActividad = document.getElementById("fechaActividadActualizar").value.trim();
  const observacionesActividad = document.getElementById("observacionesActividadActualizar").value.trim();
  const idTipoActividad = document.getElementById("idTipoActividadActualizar").value
  const idEstadoActividad = document.getElementById("idEstadoActividadActualizar").value

  // Validación de campos vacíos
  if (!idActividad || !fechaActividad || !observacionesActividad || !idTipoActividad || !idEstadoActividad) {
    alert("Por favor completa todos los campos.");
    return;
  }

  // Actualizar en Supabase
  const { data, error } = await supabaseClient
    .from("actividades_tb")
    .update({
      fecha: fechaActividad,
      observaciones: observacionesActividad,
      id_tipo_actividad_fk: parseInt(idTipoActividad),
      id_estado_fk: parseInt(idEstadoActividad)
    })
    .eq("id_actividad_pk", parseInt(idActividad));

  // Verificar si hubo error
  if (error) {
    console.error("Error al actualizar la actividad:", error);
    alert("Hubo un problema al actualizar la actividad.");
    return;
  }

  // Confirmar éxito
  console.log("Actividad actualizada:", data);
  alert("Actividad actualizada con éxito ✅");

  // Limpiar formulario
  document.getElementById("formActualizarActividad").reset();

  // Recargar la lista de actividades
  obtenerActividades();
}


async function obtenerTiposActividad() {
  const { data, error } = await supabaseClient
    .from("tipos_actividad_tb")
    .select(`
      id_tipo_actividad_pk,
      descripcion_actividad,
      id_estado_fk,
      estado_tb!inner(descripcion)
    `)
    .order("id_tipo_actividad_pk", { ascending: true }); // 👈 ORDEN ASCENDENTE


  if (error) {
    console.error("❌ Error al obtener tipos de actividades:", error);
    return;
  }

  const tbody = document.getElementById("tipos-actividad-tbody");
  tbody.innerHTML = ""; // Limpia la tabla antes de llenarla

  data.forEach((tipoActividad) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${tipoActividad.id_tipo_actividad_pk}</td>
      <td>${tipoActividad.descripcion_actividad}</td>
      <td>${tipoActividad.estado_tb.descripcion}</td>
    `;
    tbody.appendChild(fila);
  });
}



async function actualizarTiposActividad(event) {
  event.preventDefault(); // Evita que el formulario recargue la página

  // Obtener valores del formulario
  const idTipoActividad = document.getElementById("idActualizarIDTipoActividad").value.trim();
  const descripcionTipoActividad = document.getElementById("idActualizarDescripcionTipoActividad").value.trim();
  const idEstadoActividad = document.getElementById("idActualizarEstadoTipoActividad").value;

  // Validar campos vacíos
  if (!idTipoActividad || !descripcionTipoActividad || !idEstadoActividad) {
    alert("Por favor completa todos los campos.");
    return;
  }

  // Ejecutar actualización
  const { data, error } = await supabaseClient
    .from("tipos_actividad_tb")
    .update({
      descripcion_actividad: descripcionTipoActividad,
      id_estado_fk: parseInt(idEstadoActividad)
    })
    .eq("id_tipo_actividad_pk", parseInt(idTipoActividad));

  // Manejo de errores
  if (error) {
    console.error("❌ Error al actualizar el tipo de actividad:", error);
    alert("Hubo un problema al actualizar el tipo de actividad.");
    return;
  }

  // Confirmar éxito
  alert("✅ Tipo de actividad actualizada con éxito");

  // Limpiar formulario
  document.getElementById("formActualizarTipoActividad").reset();

  // Recargar lista
  obtenerTiposActividad();
}


async function obtenerAsistencia() {
  const {data, error} = await supabaseClient
    .from("actividades_participantes_v")
    .select(`
        id_actividad,
        fecha_actividad,
        tipo_actividad,
        nombre_participante
      `)
      .order("fecha_actividad", { ascending: false });

      if (error) {
      console.error("Error al obtener datos de asistencia:", error.message);
      alert("No se pudo cargar la información ❌");
      return;
    }
  
    const tbody = document.getElementById("asistencia-actividad-tbody")
    tbody.innerHTML="";

    data.forEach((actividad) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${actividad.id_actividad}</td>
        <td>${actividad.fecha_actividad}</td>
        <td>${actividad.tipo_actividad}</td>
        <td>${actividad.nombre_participante}</td>
      `;
      tbody.appendChild(fila);
    });

}


// ---------------------
// Configuración inicial al cargar la página
// ---------------------
window.onload = function () {
  // Cargar datos iniciales
  obtenerActividades();
  cargarEstadosParaSelectOption();
  cargarTiposActividadParaSelectOption();
  obtenerTiposActividad()
  obtenerAsistencia()

  document
    .getElementById("formAgregarActividad")
    .addEventListener("submit", agregarActividad);


  document
    .getElementById("formActualizarActividad")
    .addEventListener("submit", actualizarActividad);

  document
    .getElementById("formActualizarTipoActividad")
    .addEventListener("submit", actualizarTiposActividad);


};
