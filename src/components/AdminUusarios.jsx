import { useEffect, useState } from "react"

export default function AdminUsuarios({obtenerUsuarios, eliminarUsuario, cambiarRol}){
    const [usuarios, setUsuarios] = useState([])
    const usuarioActual = JSON.parse(localStorage.getItem("usuario")).id
    const [filtro, setFiltro] = useState("")

    useEffect(() => {
        obtenerUsuarios(setUsuarios)

    }, [])
    return(
        <div className="admin-usuarios">
            <h2>Administracion de usuarios</h2>
            <select className="filtro-usuarios" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                <option value="">Todos</option>
                <option value="admin">Administradores</option>
                <option value="user">Usuario</option>
            </select>
            <div className="panel-usuarios">
                <div className="panel-usuarios-header">
                    {["ID", "Nombre", "Correo", "Rol", "Accion"].map(campo => <p key={campo}>{campo}</p>)}
                </div>
                {usuarios.filter(usuario => ((filtro && filtro === usuario.rol) || !filtro) && usuario.id !== usuarioActual).map(
                    usuario => <div key={usuario.id} className="usuario">
                        <p data-label="ID">{usuario.id}</p>
                        <p data-label="Nombre">{usuario.nombre}</p>
                        <p data-label="Correo">{usuario.email}</p>
                        <select data-label="Rol" value={usuario.rol} onChange={(e) => cambiarRol(usuario.id, e.target.value, setUsuarios)}>
                            <option value="admin">Administrador</option>
                            <option value="user">Usuario</option>
                        </select>
                        <button data-label="Accion" onClick={() => {if(window.confirm("Seguro de que desea eliminar al usuario?")) eliminarUsuario(usuario.id, setUsuarios)}}>Eliminar</button>
                    </div>
                )}

            </div>
        </div>
    )
}
