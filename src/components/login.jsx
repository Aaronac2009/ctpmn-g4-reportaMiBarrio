import { useState } from "react"
import logo from "../assets/Reporta Mi Barrio Logo.png"


export default function LoginForm(){
    const [error, setError] = useState(false)

    async function login(e){
        e.preventDefault()
        const formdata = new FormData(e.target)
        const email = formdata.get("email")
        const password = formdata.get("password")

        console.log("email: " + email)
        const respuesta = await fetch("http://localhost:3000/API/login", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({email: email, password: password})
        })

        const datos = respuesta.json()
        if (!respuesta.ok){
            setError("ERROR: "+ datos.message)
            return
        }

        localStorage.setItem("usuario", datos)
        window.location.reload()
    }
    return(
        <div className="form-user">
            <img src={logo} alt="" />
            <form onSubmit={login}>
                <label htmlFor="email">Correo Electronico</label>
                <input type="email" name="email" id="email" placeholder="Coloca tu email aqui" />
                <label htmlFor="password">Contraseña</label>
                <input type="password" name="password" id="password"  placeholder="Usa una contraseña segura"/>
                <button type="submit">Entrar</button>
                {error ? <p className="error">{error}</p> : null}
            </form>
        </div>
    )
}

