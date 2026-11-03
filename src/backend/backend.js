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
let reportes = JSON.parse(await readFile(archivoReportes, "utf-8"))
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

app.get("/API", (req, res) =>{
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

app.listen(3001, () => {
    console.log("Escuchando el puerto 3001")
})



