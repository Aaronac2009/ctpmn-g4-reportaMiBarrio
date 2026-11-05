import userPhotoGeneric from "../assets/userPhotoGeneric.png"
import logo from "../assets/Reporta Mi Barrio Logo.png"
export default function Navbar({ vista, onCambiarVista }){
    const esAdmin = JSON.parse(localStorage.getItem("usuario")).rol === "admin"
    return(
        <div className="navbar">
            <img src={logo} className="logo-img" alt="" />
            <div className="user">
                <img src={userPhotoGeneric} className="user-photo" alt="" />
                <div className="user-name">
                    <p>{JSON.parse(localStorage.getItem("usuario")).nombre}</p>
                    <details>
                        <summary></summary>
                        <div className="user-options">
                            <button onClick={() => {localStorage.removeItem("usuario"); window.location.reload()}}>Cerrar Sesión</button>
                        </div>
                    </details>
                </div>
            </div>
            <div className="options">
                <button
                    className={vista === "menu" ? "opcion-activa" : ""}
                    onClick={() => onCambiarVista("menu")}
                >
                    Menu
                </button>
                <button
                    className={vista === "estadisticas" ? "opcion-activa" : ""}
                    onClick={() => onCambiarVista("estadisticas")}
                >
                    Estadisticas
                </button>
                {esAdmin ? <button
                    className={vista === "administracion" ? "opcion-activa" : ""}
                    onClick={() => onCambiarVista("administracion")}
                >
                    Administrar Usuarios
                </button> : null}
            </div>
        </div>
    )
}