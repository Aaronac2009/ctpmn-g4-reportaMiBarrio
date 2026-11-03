export async function optimizarImagen(archivo) {
    const url = URL.createObjectURL(archivo)
    try {
        const imagen = new Image()
        imagen.src = url
        await imagen.decode()
        let escala = Math.min(1, 1600 / Math.max(imagen.width, imagen.height))
        const canvas = document.createElement("canvas")
        while (true) {
            canvas.width = Math.max(1, Math.round(imagen.width * escala))
            canvas.height = Math.max(1, Math.round(imagen.height * escala))
            const contexto = canvas.getContext("2d")
            contexto.fillStyle = "#fff"
            contexto.fillRect(0, 0, canvas.width, canvas.height)
            contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height)
            const datos = canvas.toDataURL("image/jpeg", 0.88)
            if (!datos.startsWith("data:image/")) throw new Error("Imagen inválida")
            if (datos.length <= 640 * 1024) return datos
            escala *= 0.75
        }
    } finally {
        URL.revokeObjectURL(url)
    }
}
