import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import ListaReportes from './components/ListaReportes'
import AgregarReporte from './components/AgregarReporte'
import Estadisticas from './components/Estadisticas' 

function App() {
  const [reportes, setReportes] = useState([])
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false)
  const [vista, setVista] = useState("menu") 

  async function obtenerReportes(){
    try {
      const respuesta = await fetch("http://localhost:3000/API")
      if (!respuesta.ok) throw new Error("El servidor no logró obtener los datos")
      const datos = await respuesta.json()
      setReportes(datos)
    } catch (error) {
      console.log("Ocurrió un error inesperado", error)
    }
  }

  async function agregarReporte(reporte) {
    try {
      const respuesta = await fetch("http://localhost:3000/API", {
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
    }
  }
  
  function procesarImagen(e) {
    const archivo = e.target.files[0];
    if (!archivo) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(archivo);
    });
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
            <SearchBar />
            <button onClick={() => setMostrarModalAgregar(true)} className='boton-agregar'>
              Agregar un Reporte
            </button>
            <ListaReportes reportes={reportes} />
            
            {mostrarModalAgregar && (
              <AgregarReporte 
                funcionAgregar={agregarReporte} 
                procesarImagen={procesarImagen} 
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