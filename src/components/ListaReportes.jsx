export default function ListaReportes({reportes}){
    return(
        <div className="lista-reportes">
            <div className="lista-reportes-header">
                <p>Titulo</p>
                <p>Categoria</p>
                <p>Descripcion</p>
                <p>Direccion</p>
                <p>Lo viste?</p>
                <p>Imagen</p>
            </div>
            {reportes.map(reporte => (
                <div className="reporte" key={reporte.id}>
                    <p>{reporte.titulo}</p>
                    <p>{reporte.categoria}</p>
                    <p>{reporte.descripcion}</p>
                    <p>{reporte.direccion}</p>
                    <button>Si</button>
                    {reporte.imagen !== "" ? <div className="img-container"><img src={reporte.imagen}  alt="Porfavor funciona" width="50px"/></div>: <p>No</p>}
                </div>
            ))}
        </div>
    )
}