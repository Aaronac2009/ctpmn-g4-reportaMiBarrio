import { useEffect, useState } from "react"

export default function AdminUsuarios({obtenerUsuarios, eliminarUsuario}){
    const [usuarios, setUsuarios] = useState([])
    const usuarioActual = JSON.parse(localStorage.getItem("usuario")).id
    const [filtro, setFiltro] = useState(null)

    useEffect(() => {
        obtenerUsuarios(setUsuarios)

    }, [])
    return(
        <div className="admin-usuarios">
            <h2>Administracion de usuarios</h2>
            <div className="panel-usuarios">
                <div className="panel-usuarios-header">
                    {["ID", "Nombre", "Correo", "Rol", "Accion"].map(campo => <p key={campo}>{campo}</p>)}
                </div>
                {usuarios.filter(usuario => ((filtro && filtro === usuario.rol) || !filtro) && usuario.id !== usuarioActual).map(
                    usuario => <div key={usuario.id} className="usuario">
                        <p>{usuario.id}</p>
                        <p>{usuario.nombre}</p>
                        <p>{usuario.email}</p>
                        <p>{usuario.rol}</p>
                        <button onClick={() => eliminarUsuario(usuario.id, setUsuarios)}>Eliminar</button>
                    </div>
                )}

            </div>
        </div>
    )
}