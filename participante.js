async function confirmarAsistenciaParticipante() {
    try {
        // Obtenemos el usuario autenticado
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError) {
            console.error("Error al obtener usuario:", userError.message);
            alert("No se pudo verificar la sesión ❌");
            return;
        }

        if (!user) {
            alert("Debes iniciar sesión para confirmar asistencia ❌");
            window.location.href = "index.html";
            return;
        }

        // Obtenemos el idActividad desde el input
        const idActividad = document.getElementById("idActividadConfirmarAsistencia").value.trim();

        if (!idActividad) {
            alert("Por favor ingresa el ID de la actividad ⚠️");
            return;
        }

        // Insertamos en la tabla actividades_participantes_tb
        const { data, error } = await supabaseClient
            .from("actividades_participantes_tb")
            .insert([
                {
                    id_actividad_fk: parseInt(idActividad),
                    id_participante_fk: user.id, // 👈 Aquí usamos el UID del usuario autenticado
                    id_estado_fk: 1 // Estado siempre 1
                }
            ]);

        if (error) {
            console.error("Error al registrar asistencia:", error.message);
            alert("Hubo un problema al registrar tu asistencia ❌");
            return;
        }

        alert("¡Asistencia confirmada con éxito! ✅");
        console.log("Registro insertado:", data);
    } catch (err) {
        console.error("Error inesperado:", err);
        alert("Ocurrió un error inesperado ❌");
    }

    obtenerAsistenciaCompleta();//actualiza

}

async function obtenerAsistenciaCompleta() {
  try {
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error("Error al obtener usuario:", userError.message);
      alert("No se pudo verificar la sesión ❌");
      return;
    }

    if (!user) {
      alert("Debes iniciar sesión para ver tus asistencias ❌");
      window.location.href = "index.html";
      return;
    }

    // Obtenemos los datos desde la vista filtrando por el UID del usuario
    const { data, error } = await supabaseClient
      .from("actividades_participantes_v")
      .select(`
        id_actividad,
        fecha_actividad,
        tipo_actividad,
        nombre_participante
      `)
      .eq("id_participante", user.id) // 👈 Importante usar el campo correcto
      .order("fecha_actividad", { ascending: false });

    if (error) {
      console.error("Error al obtener datos:", error.message);
      alert("No se pudo cargar la información ❌");
      return;
    }

    // Pintamos la tabla
    const tbody = document.getElementById("view-asistencia-completa-tbody");
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;">No tienes participaciones registradas 🙁</td>
        </tr>
      `;
      return;
    }

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
  } catch (err) {
    console.error("Error inesperado:", err);
    alert("Ocurrió un error inesperado ❌");
  }
}


// Agregamos el listener al botón
document.addEventListener("DOMContentLoaded", () => {
  // Cargar la tabla de asistencias apenas abra la página
  obtenerAsistenciaCompleta();

  // Agregar listener al botón de confirmar asistencia
  const btnConfirmar = document.getElementById("btnConfirmarAsistencia");
  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", confirmarAsistenciaParticipante);
  }
});