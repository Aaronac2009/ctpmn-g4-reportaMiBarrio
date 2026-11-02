import { useState } from "react"

export default function AgregarReporte({ funcionAgregar, procesarImagen, funcionCerrar }) {
    async function manejarImagen(e) {
        const imagen = await procesarImagen(e);

        setNuevoReporte(reporte => ({
            ...reporte,
            imagen: imagen
        }));
    }

    const [nuevoReporte, setNuevoReporte] = useState({ titulo: "", categoria: "", descripcion: "", direccion: "", estado: "Por Completar", imagen: "", vistas: 0 })
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
                <input type="file" accept="image/*" onChange={(e) => manejarImagen(e)} />
                <button className="boton-agregar" onClick={() => {funcionAgregar(nuevoReporte); funcionCerrar()}}>Agregar</button>
            </div>
        </div>
    )
}