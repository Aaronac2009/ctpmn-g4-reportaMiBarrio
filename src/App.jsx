import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import SearchBar from './components/Searchbar'
import ListaReportes from './components/ListaReportes'
import AgregarReporte from './components/AgregarReporte'
import Estadisticas from './components/Estadisticas'
import LoginForm from './components/login'

const API = "http://localhost:3001/API"

function normalizar(texto = "") {
  return String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function App() {
  const hayUsuario = Boolean(localStorage.getItem("usuario"))
  const [reportes, setReportes] = useState([])
  const [consulta, setConsulta] = useState("")
  const [filtros, setFiltros] = useState({})
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false)
  const [vista, setVista] = useState("menu")

  useEffect(() => {
    if (!hayUsuario) return
    let activo = true
    fetch(API)
      .then(respuesta => {
        if (!respuesta.ok) throw new Error("El servidor no logro obtener los datos")
        return respuesta.json()
      })
      .then(datos => {
        if (activo) setReportes(datos)
      })
      .catch(error => {
        console.log("Ocurrio un error inesperado", error)
      })
    return () => { activo = false }
  }, [hayUsuario])

  if (!hayUsuario) {
    return (
      <div className="app">
        <LoginForm />
      </div>
    )
  }

  function cambiarFiltro(campo, valor) {
    setFiltros(actual => ({ ...actual, [campo]: valor }))
  }
  function opciones(campo) {
    return [...new Set([...reportes.map(r => r[campo]), filtros[campo]].filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "es"))
      .map(valor => [valor, valor])
  }
  const campos = [
    ["categoria", "Categoria", opciones("categoria")],
    ["estado", "Estado", opciones("estado")],
    ["foto", "Fotografia", [["con", "Con foto"], ["sin", "Sin foto"]]],
    ["vistas", "Confirmaciones", [["con", "Con confirmaciones"], ["sin", "Sin confirmaciones"]]]
  ]
  const termino = normalizar(consulta)
  const resultados = reportes
  .filter(r =>
    (!filtros.categoria || r.categoria === filtros.categoria) &&
    (!filtros.estado || r.estado === filtros.estado) &&
    (!filtros.foto || Boolean(r.imagen) === (filtros.foto === "con")) &&
    (!filtros.vistas || (Number(r.vistas) > 0) === (filtros.vistas === "con")) &&
    normalizar(r.direccion).includes(normalizar(filtros.direccion).trim()) &&
    (!termino || [r.titulo, r.categoria, r.descripcion, r.direccion].some(campo => normalizar(campo).includes(termino)))
  )
  .sort((a, b) => (Number(b?.vistas) || 0) - (Number(a?.vistas) || 0))

  async function agregarReporte(reporte) {
    try {
      const respuesta = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reporte)
      })
      if (!respuesta.ok) throw new Error("Error al agregar el reporte")
      const datos = await respuesta.json()
      setReportes(datos)
      setMostrarModalAgregar(false)
    } catch (error) {
      console.log("Ocurrio un error inesperado", error)
      throw error
    }
  }

  async function eliminarReporte(id) {
    const respuesta = await fetch(`${API}/${id}`, { method: "DELETE" })
    if (!respuesta.ok) throw new Error("No se pudo eliminar el reporte.")
    setReportes(lista => lista.filter(r => r.id !== id))
  }

  async function confirmarVista(id) {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null")
    const respuesta = await fetch(`${API}/${id}/vistas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: usuario?.id })
    })
    if (!respuesta.ok) throw new Error("No se pudo registrar la confirmacion")
    const { vistas, votantes, yaVoto } = await respuesta.json()
    setReportes(lista => lista.map(r => r.id === id ? {
      ...r,
      vistas: Math.max(r.vistas || 0, vistas || 0),
      votantes: Array.isArray(votantes) ? votantes.map(String) : (r.votantes || []),
      yaVoto
    } : r))
    return yaVoto
  }

  return (
    <div className='app'>
      <Navbar vista={vista} onCambiarVista={setVista} />

      <div className="main">
        {vista === "menu" ? (
          <>
            <section className="panel-busqueda" aria-labelledby="titulo-busqueda">
              <header>
              </header>
              <SearchBar onBuscar={setConsulta} />
              <div className="filtros-reportes" role="group" aria-label="Filtros de busqueda">
                {campos.map(([campo, etiqueta, valores]) => (
                  <label key={campo}>{etiqueta}
                    <select value={filtros[campo] || ""} onChange={e => cambiarFiltro(campo, e.target.value)}>
                      <option value="">Sin filtro</option>
                      {valores.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                    </select>
                  </label>
                ))}
                <label>Direccion<input type="search" placeholder="Barrio o calle" value={filtros.direccion || ""}
                  onChange={e => cambiarFiltro("direccion", e.target.value)} /></label>
              </div>
              <footer><span role="status">{resultados.length} de {reportes.length} reportes</span>
                <button type="button" disabled={!Object.values(filtros).some(Boolean)} onClick={() => setFiltros({})}>Quitar filtros</button>
              </footer>
            </section>
            <button onClick={() => setMostrarModalAgregar(true)} className='boton-agregar'>Agregar un Reporte</button>
            <ListaReportes reportes={resultados} confirmarVista={confirmarVista} eliminarReporte={eliminarReporte} />
            {(consulta || Object.values(filtros).some(Boolean)) && resultados.length === 0 && <p role="status">Ningun reporte coincide con tu busqueda.</p>}
            {mostrarModalAgregar && (
              <AgregarReporte
                funcionAgregar={agregarReporte}
                funcionCerrar={() => setMostrarModalAgregar(false)}
              />
            )}
          </>
        ) : (
          <Estadisticas reportes={reportes} />
        )}
      </div>
    </div>
  )
}

export default App