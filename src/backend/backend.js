import express from "express"
import { randomUUID } from "node:crypto"
import cors from "cors"
import { readFile, writeFile, rename } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const app = express()
app.use(cors())
app.use(express.json({ limit: "1mb" }))

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const archivoReportes = path.join(dirname, "reportes.json")
const archivoUsuarios = path.join(dirname, "usuarios.json")
let reportes = JSON.parse(await readFile(archivoReportes, "utf-8"))
const usuarios = JSON.parse(await readFile(archivoUsuarios, "utf-8"))
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
        ...lista, { ...req.body, id: randomUUID(), vistas: 0 }
    ])
    res.status(201).json(siguientes)
})

app.post("/API/:id/vistas", async (req, res) => {
    const id = req.params.id
    const siguientes = await actualizarReportes(lista => {
        return lista.map(r => String(r.id) === id ? { ...r, vistas: (Number(r.vistas) || 0) + 1 } : r)
    })
    const reporte = siguientes.find(r => String(r.id) === id)
    if (!reporte) return res.status(404).json({ error: "Reporte no encontrado" })
    res.json({ vistas: reporte.vistas })
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

app.listen(3001, () => {
    console.log("Escuchando el puerto 3001")
})