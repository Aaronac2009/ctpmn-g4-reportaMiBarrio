const CATEGORIAS = ["vial", "alumbrado", "basura", "agua", "seguridad vial"]
const ESTADOS = ["pendiente", "en proceso", "completado"]

const NOMBRES = {
    vial: "Vial",
    alumbrado: "Alumbrado",
    basura: "Basura",
    agua: "Agua",
    "seguridad vial": "Seguridad Vial",
    "pendiente" : "Pendiente",
    "en proceso": "En proceso",
    "completado" : "Completado"
}

function nombreDe(clave) {
    return NOMBRES[clave] || clave
}

function contarPor(reportes, campo, orden) {
    const conteo = {}

    for (const clave of orden) {
        conteo[clave] = 0
    }

    for (const reporte of reportes) {
        const clave = reporte[campo] || "Sin dato"
        conteo[clave] = (conteo[clave] || 0) + 1
    }

    return Object.entries(conteo).map(([clave, cantidad]) => ({
        clave,
        nombre: nombreDe(clave),
        cantidad,
    }))
}

function Grafica({ titulo, filas }) {
    const maximo = Math.max(1, ...filas.map((fila) => fila.cantidad))

    return (
        <section className="estadistica-tarjeta">
            <h2>{titulo}</h2>
            <ul className="estadistica-lista">
                {filas.map((fila) => (
                    <li key={fila.clave}>
                        <div className="estadistica-etiqueta">
                            <span>{fila.nombre}</span>
                            <strong>{fila.cantidad}</strong>
                        </div>
                        <div className="estadistica-barra-fondo">
                            {fila.cantidad > 0 ? (
                                <div
                                    className="estadistica-barra"
                                    style={{ width: `${(fila.cantidad / maximo) * 100}%` }}
                                />
                            ) : null}
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    )
}

export default function Estadisticas({ reportes }) {
    const porCategoria = contarPor(reportes, "categoria", CATEGORIAS)
    const porEstado = contarPor(reportes, "estado", ESTADOS)

    return (
        <div className="estadisticas">
            <div className="estadisticas-encabezado">
                <h1>Estadisticas</h1>
                <p>Cantidad de reportes por categoria y por estado.</p>
            </div>
            <p className="estadistica-total">
                Total de reportes: <strong>{reportes.length}</strong>
            </p>
            <div className="estadisticas-grid">
                <Grafica titulo="Categoria" filas={porCategoria} />
                <Grafica titulo="Estado" filas={porEstado} />
            </div>
        </div>
    )
}
