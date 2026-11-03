import { useRef, useState } from "react"

export default function ListaReportes({ reportes }) {
    const visor = useRef(null)
    const [foto, setFoto] = useState(null)
    return (
        <div className="lista-reportes">
            <div className="lista-reportes-header">
                {["Titulo", "Categoria", "Descripcion", "Direccion", "Lo viste?", "Imagen"].map(texto => <p key={texto}>{texto}</p>)}
            </div>
            {reportes.map(reporte => (
                <div className="reporte" key={reporte.id}>
                    <p>{reporte.titulo}</p>
                    <p>{reporte.categoria}</p>
                    <p>{reporte.descripcion}</p>
                    <p>{reporte.direccion}</p>
                    <button>Si</button>
                    {reporte.imagen ? <div className="img-container">
                        <button className="miniatura" aria-label={`Ampliar foto de ${reporte.titulo}`} onClick={() => {
                            setFoto(reporte)
                            visor.current.showModal()
                        }}><img src={reporte.imagen} width="50" loading="lazy" alt="" /></button>
                    </div> : <p>No</p>}
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
