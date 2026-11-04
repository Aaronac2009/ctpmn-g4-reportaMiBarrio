import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import SearchBar from './components/Searchbar'
import ListaReportes from './components/ListaReportes'
import AgregarReporte from './components/AgregarReporte'
const API = "http://localhost:3001/API"

function normalizar(texto = "") {
  return String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function App() {
  const [reportes, setReportes] = useState([])
  const [consulta, setConsulta] = useState("")
  const [filtros, setFiltros] = useState({})
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
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false)
  const [vista, setVista] = useState("menu") 

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
    } catch (error) {
      console.log("Ocurrió un error inesperado", error)
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

  return (
    <div className='app'>
      <Navbar vista={vista} onCambiarVista={setVista} />
      
      <div className="main">
        <SearchBar></SearchBar>
        <button onClick={() => setMostrarModalAgregar(true)} className='boton-agregar'>Agregar un Reporte</button>
        <ListaReportes reportes={reportes}></ListaReportes>
        {mostrarModalAgregar ? <AgregarReporte funcionAgregar={agregarReporte} procesarImagen={procesarImagen} funcionCerrar={() => setMostrarModalAgregar(false)} ></AgregarReporte> : null}

      </div>
    </div>
  )
}

export default App
