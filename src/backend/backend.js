import express from "express"
import cors from "cors"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const app = express()
app.use(cors())
app.use(express.json({ limit: "1mb" }))

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const archivoReportes = path.join(dirname, "reportes.json")
const archivoUsuarios = path.join(dirname, "usuarios.json")

const reportes =  JSON.parse(await readFile(archivoReportes, "utf-8"))

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

app.listen(3000, () => {
    console.log("Escuchando el puerto 3000")
})

