import { useRef, useState } from "react"

export default function ListaReportes({ reportes, confirmarVista, eliminarReporte }) {
    const [errores, setErrores] = useState({})
    async function marcar(id) {
        try {
            await confirmarVista(id)
            setErrores(actual => ({ ...actual, [id]: false }))
        } catch {
            setErrores(actual => ({ ...actual, [id]: "No se pudo guardar. Pulsa Sí para reintentar." }))
        }
    }
    async function eliminar(reporte) {
        if (!window.confirm(`¿Eliminar el reporte «${reporte.titulo}»? Esta acción es permanente.`)) return
        try {
            await eliminarReporte(reporte.id)
        } catch {
            setErrores(actual => ({ ...actual, [reporte.id]: "No se pudo eliminar el reporte. Inténtalo de nuevo." }))
        }
    }
    const visor = useRef(null)
    const [foto, setFoto] = useState(null)
    return (
        <div className="lista-reportes">
            <div className="lista-reportes-header">
                {["Titulo", "Categoria", "Descripcion", "Direccion", "Lo viste?", "Imagen", "Acciones"].map(texto => <p key={texto}>{texto}</p>)}
            </div>
            {reportes.map(reporte => (
                <div className="grupo-reporte" key={reporte.id}>
                <div className="reporte">
                    <p>{reporte.titulo}</p>
                    <p>{reporte.categoria}</p>
                    <p>{reporte.descripcion}</p>
                    <p>{reporte.direccion}</p>
                    <button onClick={() => marcar(reporte.id)}>Sí</button>
                    {reporte.imagen ? <div className="img-container">
                        <button className="miniatura" aria-label={`Ampliar foto de ${reporte.titulo}`} onClick={() => {
                            setFoto(reporte)
                            visor.current.showModal()
                        }}><img src={reporte.imagen} width="50" loading="lazy" alt="" /></button>
                    </div> : <p>No</p>}
                    <button onClick={() => eliminar(reporte)}>Eliminar</button>
                </div>
                    <div aria-live="polite">{reporte.vistas > 0 && <p className="fila-vistas">Lo vieron: {reporte.vistas}</p>}</div>
                    {errores[reporte.id] && <p role="alert">{errores[reporte.id]}</p>}
                </div>
            ))}
            <dialog className="visor" ref={visor} aria-label="Foto del reporte" onClose={() => setFoto(null)}>
                <button className="cerrar-foto" aria-label="Cerrar foto" onClick={() => visor.current.close()}>×</button>
                {foto && <img src={foto.imagen} alt={foto.titulo || "Foto del reporte"} onLoad={({ currentTarget: imagen }) => {
                    imagen.style.setProperty("--proporcion", imagen.naturalWidth / imagen.naturalHeight)
                }} />}
            </dialog>
        </div>
    )
}

