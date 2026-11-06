import { useRef, useState } from "react"

export default function ListaReportes({ reportes, confirmarVista, eliminarReporte, cambiarEstadoReporte }) {
    const [errores, setErrores] = useState({})
    const esAdmin = JSON.parse(localStorage.getItem("usuario")).rol === "admin"
    const [presionados, setPresionados] = useState({})
    const usuarioActual = (() => {
        try { return JSON.parse(localStorage.getItem("usuario") || "null") } catch { return null }
    })()
    const reportesOrdenados = [...reportes].sort((a, b) =>
        (Number(b?.vistas) || 0) - (Number(a?.vistas) || 0)
    )
    async function marcar(id) {
        setPresionados(actual => ({ ...actual, [id]: true }))
        try {
            await confirmarVista(id)
            setErrores(actual => ({ ...actual, [id]: false }))
        } catch {
            setErrores(actual => ({ ...actual, [id]: "No se pudo guardar. Pulsa Sí para reintentar." }))
        } finally {
            window.setTimeout(() => {
                setPresionados(actual => ({ ...actual, [id]: false }))
            }, 700)
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

    async function cambiarEstado(event, id) {
        if (event.target.value === "completado"){
            if(!window.confirm("Seguro de que desea completar este reporte? Eliminara el reporte de la lista")){
                return
            }
        }
        cambiarEstadoReporte(id, event.target.value)
        if (event.target.value === "completado") eliminarReporte(id)
    }

    const visor = useRef(null)
    const [foto, setFoto] = useState(null)
    return (
        <div className="lista-reportes">
            <div className="lista-reportes-header">
                <p>Titulo</p>
                <p>Categoria</p>
                <p>Descripcion</p>
                <p>Direccion</p>
                <p>Lo viste?</p>
                <p>Imagen</p>
                {esAdmin && <p>Estado</p> }
                <p>Accion</p>
            </div>
            {reportesOrdenados.map(reporte => (
                <div className="grupo-reporte" key={reporte.id}>
                <div className="reporte">
                    <p data-label="Titulo">{reporte.titulo}</p>
                    <p data-label="Categoria">{reporte.categoria}</p>
                    <p data-label="Descripcion">{reporte.descripcion}</p>
                    <p data-label="Direccion">{reporte.direccion}</p>
                    {(() => {
                        const yaVoto = (reporte.votantes || []).map(String).includes(String(usuarioActual?.id))
                        return (
                            <button
                                type="button"
                                data-label="Confirmaciones"
                                disabled={yaVoto}
                                className={`boton-visto ${presionados[reporte.id] ? "boton-visto-activo" : ""} ${yaVoto ? "boton-visto-votado" : ""}`}
                                onClick={() => { if (!yaVoto) marcar(reporte.id) }}
                                aria-label={yaVoto ? `Ya confirmaste que viste ${reporte.titulo}` : `Confirmar que viste ${reporte.titulo}`}
                            >
                                {yaVoto ? "Ya votaste" : "Sí"}
                                <span className="contador-vistas" aria-label={`Visto ${reporte.vistas || 0} veces`}>
                                    {reporte.vistas || 0}
                                </span>
                            </button>
                        )
                    })()}
                    {reporte.imagen ? <div className="img-container" data-label="Imagen">
                        <button className="miniatura" aria-label={`Ampliar foto de ${reporte.titulo}`} onClick={() => {
                            setFoto(reporte)
                            visor.current.showModal()
                        }}><img src={reporte.imagen} width="50" loading="lazy" alt="" /></button>
                    </div> : <p data-label="Imagen">No</p>}
                    {esAdmin ? <select data-label="Estado" value={reporte.estado} onChange={(e) => cambiarEstado(e, reporte.id)}>
                        <option value="pendiente">Pendiente</option>
                        <option value="en proceso">En Proceso</option>
                        <option value="completado">Completado</option>
                    </select> : null}
                    <button data-label="Accion" onClick={() => eliminar(reporte)}>Eliminar</button>
                </div>
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

