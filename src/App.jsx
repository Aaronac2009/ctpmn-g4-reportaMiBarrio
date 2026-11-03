import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import SearchBar from './components/Searchbar'
import ListaReportes from './components/ListaReportes'
import AgregarReporte from './components/AgregarReporte'
const API = "http://localhost:3001/API"

function App() {
  const [reportes, setReportes] = useState([])
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false)

  async function obtenerReportes(){
    console.log("Solicitud para obtener datos")
    try{
      const respuesta = await fetch(API)
      console.log("Ocurrio el fetch")
      if (!respuesta.ok){
        throw new Error("El servidor no logro obtener los datos")
      }
      const datos = await respuesta.json()
      setReportes(datos)
      console.log(typeof(reportes))


    }
    catch (error){
      console.log("Ocurrio un error inesperado", error)
    }
  }

  async function agregarReporte(reporte) {
    const respuesta = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reporte)
    })
    if (!respuesta.ok) throw new Error("No se pudo guardar el reporte")
    setReportes(await respuesta.json())
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

  return(
    <div className='app'>
      <Navbar></Navbar>
      <div className="main">
        <SearchBar></SearchBar>
        <button onClick={() => setMostrarModalAgregar(true)} className='boton-agregar'>Agregar un Reporte</button>
        <ListaReportes reportes={reportes} confirmarVista={confirmarVista} eliminarReporte={eliminarReporte} />
        {mostrarModalAgregar ? <AgregarReporte funcionAgregar={agregarReporte} funcionCerrar={() => setMostrarModalAgregar(false)} ></AgregarReporte> : null}

      </div>
    </div>
  )
}

export default App





