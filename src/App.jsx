import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import ListaReportes from './components/ListaReportes'
import AgregarReporte from './components/AgregarReporte'
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

  async function agregarReporte(reporte) {
    try{
      const respuesta = await fetch("http://localhost:3000/API", 
        {method:"POST", 
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify(reporte)
        }
      )
      console.log("Ocurrio el fetch")
      if (!respuesta.ok){
        throw new Error("El servidor no logro obtener los datos")
      }
      const datos = await respuesta.json()
      setReportes(datos)
    }
    catch (error){
      console.log("Ocurrio un error inesperado", error)
    }
  }
  

function procesarImagen(e) {
  const archivo = e.target.files[0];

  if (!archivo) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(archivo);
  });
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
        <AgregarReporte funcionAgregar={agregarReporte} procesarImagen={procesarImagen} ></AgregarReporte>
      </div>
    </div>
  )
}

export default App
