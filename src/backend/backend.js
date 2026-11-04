import express from "express"
import cors from "cors"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const app = express()
app.use(cors())
app.use(express.json())

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const archivoReportes = path.join(dirname, "reportes.json")
const archivoUsuarios = path.join(dirname, "usuarios.json")

const reportes =  JSON.parse(await readFile(archivoReportes, "utf-8"))
const usuarios = JSON.parse(await readFile(archivoUsuarios, "utf-8"))

async function guardarArchivo(informacion, archivo){
    await writeFile(archivo, JSON.stringify(informacion, null, 2), "utf-8")
}

app.get("/API", (req, res) =>{
    console.log("Se solicito la lista de reportes")
    res.json(reportes)
})

app.post("/API", async (req, res) => {
    console.log("Se solicito agregar un reporte")
    const reporte = req.body
    console.log(req.body)
    let id = 0;
    if (reportes.length > 0){
        console.log("Ya existia una id, se agrego una nueva")
        id = reportes[reportes.length-1].id + 1
    }

    reportes.push({id:id, ...reporte})
    await guardarArchivo(reportes, archivoReportes)
    console.log("Se guardo el nuevo reporte")
    res.status(201).json(reportes)
})

app.post("/API/login", (req, res) =>{
    console.log("Solicitud para iniciar sesion")
    const {email, password} = req.body
    const usuarioEncontrado = usuarios.find(usuario => usuario.email === email.toLowerCase() && usuario.password === password)
    if(!usuarioEncontrado){
        return res.status(401).json({error:true, message:"Credenciales incorrectos"})
    }

    return res.json({"id":usuarioEncontrado.id,
        "nombre":usuarioEncontrado.nombre,
        "rol":usuarioEncontrado.rol})

})

app.post("/API/login/create", async (req, res) => {
    console.log("Solicitud para crear una nueva cuenta")
    const {nombre, email, password} = req.body
    // Comprueba longitud de nombre

    if (nombre.trim().length < 3) {
        return res.status(400).json({
            message: "El nombre debe tener al menos 3 caracteres"
        })
    }
    if (nombre.trim().length > 50) {
        return res.status(400).json({
            message: "El nombre no puede superar los 50 caracteres"
        })
    }

    if(usuarios.some(usuario => usuario.email === email)){
        return res.status(409).json({
            message: "Este correo ya esta asociado con otra cuenta"
        })
    }

    let id = 0
    if(usuarios.length > 0){
        id = usuarios[usuarios.length -1].id + 1
    } 

    // Hace que el primer usuario sea admin, esto sirve para pruebas
    let rol = "user"
    if (id === 0){
        rol = "admin"
    }

    usuarios.push({id:id, nombre:nombre, email:email, rol:rol, password:password})
    await guardarArchivo(usuarios ,archivoUsuarios)

    return res.status(201).json({id:id, nombre:nombre, rol:rol})

})

app.listen(3000, () => {
    console.log("Escuchando el puerto 3000")
})

