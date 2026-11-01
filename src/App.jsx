import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import ListaReportes from './components/ListaReportes'

function App() {
  const [reportes, setReportes] = useState([])


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

  useEffect(() => {
    obtenerReportes()
  }, [])

  return(
    <div className='app'>
      <Navbar></Navbar>
      <div className="main">
        <SearchBar></SearchBar>
        <ListaReportes reportes={reportes}></ListaReportes>
      </div>
    </div>
  )
}

export default App
