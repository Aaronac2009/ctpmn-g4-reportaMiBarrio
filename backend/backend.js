import express from "express"
import { randomUUID } from "node:crypto"
import cors from "cors"
import { readFile, writeFile, rename } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const app = express()
// Estp es por el tema del deploy, todo lo del env se le asigna desde render
const origenesPermitidos = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({origin:origenesPermitidos}))
app.use(express.json({ limit: "1mb" }))

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const archivoReportes = path.join(dirname, "reportes.json")
const archivoUsuarios = path.join(dirname, "usuarios.json")
let reportes = JSON.parse(await readFile(archivoReportes, "utf-8")).map(reporte => ({
    ...reporte,
    votantes: Array.isArray(reporte?.votantes) ? reporte.votantes.map(String) : []
}))
let usuarios = JSON.parse(await readFile(archivoUsuarios, "utf-8"))
let escritura = Promise.resolve()

function actualizarReportes(transformar) {
    const turno = escritura.then(async () => {
        const siguientes = transformar(reportes)
        await writeFile(archivoReportes + ".tmp", JSON.stringify(siguientes, null, 2), "utf-8")
        await rename(archivoReportes + ".tmp", archivoReportes)
        reportes = siguientes
        return siguientes
    })
    escritura = turno.catch(() => {})
    return turno
}

async function guardarArchivo(informacion, archivo) {
    await writeFile(archivo, JSON.stringify(informacion, null, 2), "utf-8")
}

app.get("/API", (req, res) => {
    console.log("Se solicito la lista de reportes")
    res.json(reportes)
})

app.post("/API", async (req, res) => {
    const siguientes = await actualizarReportes(lista => [
        ...lista, { ...req.body, id: randomUUID(), vistas: 0, votantes: [] }
    ])
    res.status(201).json(siguientes)
})

app.post("/API/:id/vistas", async (req, res) => {
    const id = req.params.id
    const usuarioId = req.body?.usuarioId ?? req.body?.userId ?? null
    const usuarioNormalizado = usuarioId == null ? null : String(usuarioId)
    let yaVoto = false
    const siguientes = await actualizarReportes(lista => {
        return lista.map(r => {
            if (String(r.id) !== id) return r
            const votantes = Array.isArray(r.votantes) ? r.votantes.map(String) : []
            if (usuarioNormalizado && votantes.includes(usuarioNormalizado)) {
                yaVoto = true
                return { ...r, votantes }
            }
            return {
                ...r,
                vistas: (Number(r.vistas) || 0) + 1,
                votantes: usuarioNormalizado ? [...votantes, usuarioNormalizado] : votantes
            }
        })
    })
    const reporte = siguientes.find(r => String(r.id) === id)
    if (!reporte) return res.status(404).json({ error: "Reporte no encontrado" })
    res.json({ vistas: reporte.vistas, yaVoto, votantes: reporte.votantes || [] })
})

app.delete("/API/:id", async (req, res) => {
    await actualizarReportes(lista => lista.filter(r => String(r.id) !== req.params.id))
    res.sendStatus(204)
})

app.post("/API/login", (req, res) => {
    console.log("Solicitud para iniciar sesion")
    const { email, password } = req.body
    const usuarioPorEmail = usuarios.find(usuario => usuario.email === email.toLowerCase())
    if (!usuarioPorEmail) {
        return res.status(404).json({ error: true, message: "No existe una cuenta con ese correo" })
    }
    if (usuarioPorEmail.password !== password) {
        return res.status(401).json({ error: true, message: "Credenciales incorrectos" })
    }

    return res.json({ "id": usuarioPorEmail.id,
        "nombre": usuarioPorEmail.nombre,
        "rol": usuarioPorEmail.rol })
})

app.post("/API/login/create", async (req, res) => {
    console.log("Solicitud para crear una nueva cuenta")
    const { nombre, email, password } = req.body

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

    if (usuarios.some(usuario => usuario.email === email.toLowerCase())) {
        return res.status(409).json({
            message: "Este correo ya esta asociado con otra cuenta"
        })
    }

    let id = 0
    if (usuarios.length > 0) {
        id = usuarios[usuarios.length - 1].id + 1
    }

    let rol = "user"
    if (id === 0) {
        rol = "admin"
    }

    usuarios.push({ id: id, nombre: nombre, email: email.toLowerCase(), rol: rol, password: password })
    await guardarArchivo(usuarios, archivoUsuarios)

    return res.status(201).json({ id: id, nombre: nombre, rol: rol })
})

app.patch("/API/:id/:estado", async (req, res) =>{
    console.log("Se socilicto cambiar el estado de un elemento")
    const id = req.params.id
    console.log("La id a editar es: "+ id)
    const estado = req.params.estado
    const reporteID = reportes.findIndex(reporte => reporte.id === id)
    if(reporteID !== -1){
        await actualizarReportes(reportes => reportes.map(reporte => reporte.id === id ? {...reporte, estado:estado} :  reporte))
        return res.json(reportes)
    }
    console.log("No se encontro la id deseada")
    return res.status(404).json({message:"Error al cambiar el estado del usuario"})
})

app.get("/API/users", (req, res) => {
    console.log("Se solicito obtener la lista de usuarios")
    return res.json(usuarios)
})

app.delete("/API/users/:id", async (req, res) =>{
    console.log("Se solicito eliminar un usuario")
    const id = parseInt(req.params.id)
    console.log(id)
    if (usuarios.findIndex(usuario => usuario.id === id) === -1){
        console.log("No se pudo encontrar el usuario con la id buscada")
        return res.status(404).json({message:"No se pudo encontrar el usuario con la id buscada"})
    }
    usuarios = usuarios.filter(usuario => usuario.id !== id)
    await guardarArchivo(usuarios, archivoUsuarios)
    return res.json(usuarios)
})

app.patch("/API/users/:id/:rol", async (req, res) =>{
    console.log("Se socilicto cambiar el rol de un elemento")
    const id = parseInt(req.params.id)
    console.log("La id a editar es: "+ id)
    const rol = req.params.rol
    const usuarioID = usuarios.findIndex(usuario => usuario.id === id)
    if(usuarioID !== -1){
        usuarios = usuarios.map(usuario => usuario.id === id ? {...usuario, rol:rol} :  usuario)
        await guardarArchivo(usuarios, archivoUsuarios);
        return res.json(usuarios)
    }
    console.log("No se encontro la id deseada")
    return res.status(404).json({message:"Error al cambiar el estado del usuario"})
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log("Escuchando el puerto 3001")
})