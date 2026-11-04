import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import SearchBar from './components/Searchbar'
import ListaReportes from './components/ListaReportes'
import AgregarReporte from './components/AgregarReporte'
import Estadisticas from './components/Estadisticas'

const API = "http://localhost:3001/API"

function normalizar(texto = "") {
  return String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function App() {
  const [reportes, setReportes] = useState([])
  const [consulta, setConsulta] = useState("")
  const [filtros, setFiltros] = useState({})
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false)
  const [vista, setVista] = useState("menu")

  function cambiarFiltro(campo, valor) {
    setFiltros(actual => ({ ...actual, [campo]: valor }))
  }
  function opciones(campo) {
    return [...new Set([...reportes.map(r => r[campo]), filtros[campo]].filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "es"))
      .map(valor => [valor, valor])
  }
  const campos = [
    ["categoria", "Categoría", opciones("categoria")],
    ["estado", "Estado", opciones("estado")],
    ["foto", "Fotografía", [["con", "Con foto"], ["sin", "Sin foto"]]],
    ["vistas", "Confirmaciones", [["con", "Con confirmaciones"], ["sin", "Sin confirmaciones"]]]
  ]
  const termino = normalizar(consulta)
  const resultados = reportes.filter(r =>
    (!filtros.categoria || r.categoria === filtros.categoria) &&
    (!filtros.estado || r.estado === filtros.estado) &&
    (!filtros.foto || Boolean(r.imagen) === (filtros.foto === "con")) &&
    (!filtros.vistas || (Number(r.vistas) > 0) === (filtros.vistas === "con")) &&
    normalizar(r.direccion).includes(normalizar(filtros.direccion).trim()) &&
    (!termino || [r.titulo, r.categoria, r.descripcion, r.direccion].some(campo => normalizar(campo).includes(termino)))
  )

  async function obtenerReportes() {
    try {
      const respuesta = await fetch(API)
      if (!respuesta.ok) throw new Error("El servidor no logró obtener los datos")
      const datos = await respuesta.json()
      setReportes(datos)
    } catch (error) {
      console.log("Ocurrió un error inesperado", error)
    }
  }

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
      console.log("Ocurrió un error inesperado", error)
      throw error
    }
  }

  async function eliminarReporte(id) {
    const respuesta = await fetch(`${API}/${id}`, { method: "DELETE" })
    if (!respuesta.ok) throw new Error("No se pudo eliminar el reporte.")
    setReportes(lista => lista.filter(r => r.id !== id))
  }

  async function confirmarVista(id) {
    const respuesta = await fetch(`${API}/${id}/vistas`, { method: "POST" })
    if (!respuesta.ok) throw new Error("No se pudo registrar la confirmación")
    const { vistas } = await respuesta.json()
    setReportes(lista => lista.map(r => r.id === id ? { ...r, vistas: Math.max(r.vistas || 0, vistas) } : r))
  }

  useEffect(() => {
    obtenerReportes()
  }, [])

  return (
    <div className='app'>
      <Navbar vista={vista} onCambiarVista={setVista} />

      <div className="main">
        {vista === "menu" ? (
          <>
            <section className="panel-busqueda" aria-labelledby="titulo-busqueda">
              <header><span className="seccion-barrio">REPORTES DE LA COMUNIDAD</span>
                <h1 id="titulo-busqueda">Explora tu barrio</h1>
              </header>
              <SearchBar onBuscar={setConsulta} />
              <div className="filtros-reportes" role="group" aria-label="Filtros de búsqueda">
                {campos.map(([campo, etiqueta, valores]) => (
                  <label key={campo}>{etiqueta}
                    <select value={filtros[campo] || ""} onChange={e => cambiarFiltro(campo, e.target.value)}>
                      <option value="">Sin filtro</option>
                      {valores.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                    </select>
                  </label>
                ))}
                <label>Dirección<input type="search" placeholder="Barrio o calle" value={filtros.direccion || ""}
                  onChange={e => cambiarFiltro("direccion", e.target.value)} /></label>
              </div>
              <footer><span role="status">{resultados.length} de {reportes.length} reportes</span>
                <button type="button" disabled={!Object.values(filtros).some(Boolean)} onClick={() => setFiltros({})}>Quitar filtros</button>
              </footer>
            </section>
            <button onClick={() => setMostrarModalAgregar(true)} className='boton-agregar'>Agregar un Reporte</button>
            <ListaReportes reportes={resultados} confirmarVista={confirmarVista} eliminarReporte={eliminarReporte} />
            {(consulta || Object.values(filtros).some(Boolean)) && resultados.length === 0 && <p role="status">Ningún reporte coincide con tu búsqueda.</p>}
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
