import userPhotoGeneric from "../assets/userPhotoGeneric.png"
import logo from "../assets/Reporta Mi Barrio Logo.png"
export default function Navbar(){
    return(
        <div className="navbar">
            <img src={logo} className="logo-img" alt="" />
            <div className="user">
                <img src={userPhotoGeneric} className="user-photo" alt="" />
                <div className="user-name">
                    <p>{localStorage.getItem("usuario").nombre}</p>
                    <details>
                        <summary></summary>
                        <div className="user-options">
                            <button>Modo Administrador</button>
                            <button>Cerrar Session</button>
                        </div>
                    </details>
                </div>
            </div>
            <div className="options">
                <button>Menu</button>
                <button>Estadisticas</button>
                
            </div>
        </div>
    )
}