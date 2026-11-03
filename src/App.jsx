import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import SearchBar from './components/Searchbar'
import ListaReportes from './components/ListaReportes'
import AgregarReporte from './components/AgregarReporte'
function App() {
  const [reportes, setReportes] = useState([])
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false)

  async function obtenerReportes(){
    console.log("Solicitud para obtener datos")
    try{
      const respuesta = await fetch("http://localhost:3000/API")
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
    const respuesta = await fetch("http://localhost:3000/API", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reporte)
    })
    if (!respuesta.ok) throw new Error("No se pudo guardar el reporte")
    setReportes(await respuesta.json())
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
        <ListaReportes reportes={reportes}></ListaReportes>
        {mostrarModalAgregar ? <AgregarReporte funcionAgregar={agregarReporte} funcionCerrar={() => setMostrarModalAgregar(false)} ></AgregarReporte> : null}

      </div>
    </div>
  )
}

export default App



