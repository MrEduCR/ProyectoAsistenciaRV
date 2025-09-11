// -----------------------------
// Inicializar cliente de Supabase
// -----------------------------
const supabaseClient = supabase.createClient(
  "https://huwbufqmgjyxfihxkebg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1d2J1ZnFtZ2p5eGZpaHhrZWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MjA0MDUsImV4cCI6MjA3MDE5NjQwNX0.oLPfHtl63U2S2eg67uedHba6YoTzJwDIj-vayAO4Ww0"
);

// -----------------------------
// Registro de usuario
// -----------------------------
async function registrarUsuario(email, password) {
  try {
    const nombre = document.getElementById("nameRegistro").value.trim();
    if (!nombre) {
      alert("Por favor ingresa tu nombre.");
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) throw error;

    const user = data.user;

    const { error: insertError } = await supabaseClient
      .from("participantes_tb")
      .insert([
        {
          id_participante_pk: user.id,
          nombre: nombre,
          id_rol_fk: 3,       // participante por defecto
          id_estado_fk: 1,    // activo
        },
      ]);

    if (insertError) throw insertError;

    alert("Registro exitoso ✅. Verifica tu correo si es necesario.");
    window.location.href = "index.html";
  } catch (err) {
    console.error("Error al registrar:", err.message);
    alert("Error al registrar: " + err.message);
  }
}

// -----------------------------
// Inicio de sesión
// -----------------------------
async function iniciarSesion(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const user = data.user;

    // Traer datos del participante con inner join
    const { data: participante, error: joinError } = await supabaseClient
      .from("participantes_tb")
      .select(`
        id_participante_pk,
        nombre,
        id_rol_fk,
        roles_tb:roles_tb!inner(descripcion),
        estado_tb:estado_tb!inner(descripcion)
      `)
      .eq("id_participante_pk", user.id)
      .single();

    if (joinError) throw joinError;

    // Guardar info en sessionStorage para usar en otras páginas
    sessionStorage.setItem("usuarioNombre", participante.nombre);
    sessionStorage.setItem("usuarioRol", participante.roles_tb.descripcion);

    // Redirigir según rol
    const rol = participante.roles_tb.descripcion.toLowerCase().trim();
    if (rol === "admin") {
      alert("Bienvenido Admin 👋");
      window.location.href = "admin.html";
    } else if (rol === "participante") {
      alert("Bienvenido Participante 👋");
      window.location.href = "participante.html";
    } else {
      alert("Todavía no tienes acceso 🚫");
    }
  } catch (err) {
    console.error("Error al iniciar sesión:", err.message);
    alert("Error al iniciar sesión: " + err.message);
  }
}

// -----------------------------
// Cerrar sesión
// -----------------------------
async function cerrarSesion() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error("Error al cerrar sesión:", error.message);
    alert("No se pudo cerrar sesión ❌");
    return;
  }
  sessionStorage.clear();
  alert("Sesión cerrada ✅");
  window.location.href = "index.html";
}

// Conectar botón de cerrar sesión si existe
const btnCerrar = document.getElementById("btnCerrarSesion");
if (btnCerrar) {
  btnCerrar.addEventListener("click", cerrarSesion);
}

// -----------------------------
// Bloquear acceso si no hay sesión
// -----------------------------
function verificarSesion() {
  const user = supabaseClient.auth.user();
  if (!user) {
    alert("Debes iniciar sesión primero");
    window.location.href = "index.html";
  }
}

// -----------------------------
// Conectar formularios
// -----------------------------
// Ligar función al botón
window.onload = function () {
  const botonCerrarSesion = document.getElementById("btnCerrarSesion");
  if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", cerrarSesion);
  }

  // Aquí van tus demás listeners de formularios
  const formRegistro = document.getElementById("formRegistro");
  if (formRegistro) {
    formRegistro.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("emailRegistro").value;
      const password = document.getElementById("passRegistro").value;
      await registrarUsuario(email, password);
    });
  }

  const formLogin = document.getElementById("formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("emailLogin").value;
      const password = document.getElementById("passLogin").value;
      await iniciarSesion(email, password);
    });
  }
};
