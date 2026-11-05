import { optimizarImagen } from "../backend/optimizarImagen"
import { useState } from "react"

export default function AgregarReporte({ funcionAgregar, funcionCerrar }) {
    const [ocupado, setOcupado] = useState(false)
    const [error, setError] = useState("")
    async function manejarImagen(e) {
        const input = e.target
        const archivo = input.files[0]
        setError("")
        setNuevoReporte(r => ({ ...r, imagen: "" }))
        if (!archivo) return
        setOcupado(true)
        try {
            const imagen = await optimizarImagen(archivo)
            setNuevoReporte(r => ({ ...r, imagen }))
        } catch {
            input.value = ""
            setError("No se pudo leer la foto. Prueba con una imagen JPG o PNG.")
        } finally {
            setOcupado(false)
        }
    }
    async function guardar() {
        setOcupado(true)
        setError("")
        try {
            await funcionAgregar(nuevoReporte)
            funcionCerrar()
        } catch {
            setError("No se pudo guardar el reporte. Inténtalo de nuevo.")
        } finally {
            setOcupado(false)
        }
    }

    const [nuevoReporte, setNuevoReporte] = useState({ titulo: "", categoria: "", descripcion: "", direccion: "", estado: "pendiente", imagen: "", vistas: 0 })
    return (
        <div className="modal-agregar-container">
            <div className="modal-agregar">
                <button className="modal-cerrar" onClick={funcionCerrar}>X</button>
                <label htmlFor="titulo">Titulo del Reporte</label>
                <input type="text" value={nuevoReporte.titulo} onChange={(e) => setNuevoReporte({ ...nuevoReporte, titulo: e.target.value })} />

                <label htmlFor="categoria">Categoria</label>
                <select name="categoria" id="categoria" value={nuevoReporte.categoria} onChange={(e) => setNuevoReporte({ ...nuevoReporte, categoria: e.target.value })}>
                    <option value="" disabled>Selecciona una categoría</option>
                    <option value="vial">Vial</option>
                    <option value="alumbrado">Alumbrado</option>
                    <option value="basura">Basura</option>
                    <option value="agua">Agua</option>
                    <option value="seguridad vial">Seguridad Vial</option>
                </select>

                <label htmlFor="descripcion">Agrega una descripcion</label>
                <input type="text" value={nuevoReporte.descripcion} onChange={(e) => setNuevoReporte({ ...nuevoReporte, descripcion: e.target.value })} />

                <label htmlFor="Direccion">Direccion del Reporte</label>
                <input type="text" value={nuevoReporte.direccion} onChange={(e) => setNuevoReporte({ ...nuevoReporte, direccion: e.target.value })} />

                <label htmlFor="Direccion">Imagen (Opcional)</label>
                <input disabled={ocupado} type="file" accept="image/*" onChange={(e) => manejarImagen(e)} />
                {error && <p role="alert">{error}</p>}
                <button className="boton-agregar" disabled={ocupado} onClick={guardar}>{ocupado ? "Procesando…" : "Agregar"}</button>
            </div>
        </div>
    )
}
