import { useEffect, useState } from "react"
import logo from "../assets/Reporta Mi Barrio Logo.png"


export default function LoginForm(){
    const API = `${import.meta.env.VITE_API_URL}/API`
    const [error, setError] = useState(null)
    const [type, setType] = useState("login")
    const [datosPrefill, setDatosPrefill] = useState({ nombre: "", email: "", password: "" })

    useEffect(() => {
        if (!error) return
        const temporizador = setTimeout(() => setError(null), 3000)
        return () => clearTimeout(temporizador)
    }, [error])

    async function login(e){
        e.preventDefault()
        const formdata = new FormData(e.target)
        const email = formdata.get("email")
        const password = formdata.get("password")
        const respuesta = await fetch(`${API}/login`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({email: email, password: password})
        })

        const datos = await respuesta.json()
        if (!respuesta.ok){
            setError("ERROR: "+ datos.message)
            if (respuesta.status === 404) {
                setDatosPrefill({ nombre: "", email: email, password: password })
                setType("create")
            }
            return
        }

        localStorage.setItem("usuario", JSON.stringify(datos))
        window.location.reload()
    }

    async function create(e) {
        e.preventDefault()
        const formdata = new FormData(e.target)
        const nombre = formdata.get("nombre")
        const email = formdata.get("email").toLowerCase()
        const password = formdata.get("password")

        const respuesta = await fetch(`${API}/login/create`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({nombre: nombre, email: email, password: password})
        })
        const datos = await respuesta.json()

        if(!respuesta.ok){
            setError("ERROR: "+ datos.message)
            return
        }

        localStorage.setItem("usuario", JSON.stringify(datos))
        window.location.reload()
    }

    // formulario login
    if (type === "login"){
        return(
            <div className="form-user-container">
                <div className="form-user">
                    <img src={logo} alt="" />
                    <form key="login" onSubmit={login} className="formulario" id="form-login">
                        <label htmlFor="email">Correo Electronico</label>
                        <input type="email" name="email" id="email" placeholder="Coloca tu email aqui" defaultValue={datosPrefill.email} />
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" name="password" id="password"  placeholder="********" defaultValue={datosPrefill.password}/>
                        <div className="create">
                            <p>No tienes una cuenta? </p>
                            <button type="button" className="createAccount" onClick={() => {setType("create")}}>Crea Una</button>
                        </div>
                        <button type="submit">Entrar</button>
                        {error ? <p className="error">{error}</p> : null}

                    </form>
                </div>
            </div>
        )
    }

    if(type === "create"){
        return(
            <div className="form-user-container">
                <div className="form-user">
                    <img src={logo} alt="" />
                    <form key="create" onSubmit={create} className="formulario" id="form-create">
                        <label htmlFor="nombre">Nombre de Usuario</label>
                        <input type="text" name="nombre"  placeholder="John Doe..." defaultValue={datosPrefill.nombre} />
                        <label htmlFor="email">Correo Electronico</label>
                        <input type="email" name="email"  placeholder="Coloca tu email aqui" defaultValue={datosPrefill.email} />
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" name="password" placeholder="Usa una contraseña segura" defaultValue={datosPrefill.password} />
                        <div className="create">
                            <p>Ya tienes una cuenta? </p>
                            <button type="button" className="createAccount" onClick={() => setType("login")}>Inicia Sesion</button>
                        </div>
                        <button type="submit">Crear cuenta</button>
                        {error ? <p className="error">{error}</p> : null}

                    </form>
                </div>
            </div>
        )
    }

}

