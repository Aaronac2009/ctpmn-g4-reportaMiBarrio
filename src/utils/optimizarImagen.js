export async function optimizarImagen(archivo) {
  const url = URL.createObjectURL(archivo)
  try {
    const imagen = await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("No se pudo leer la imagen"))
      img.src = url
    })

    let escala = Math.min(1, 1600 / Math.max(imagen.width || 1, imagen.height || 1))
    const canvas = document.createElement("canvas")
    while (true) {
      canvas.width = Math.max(1, Math.round(imagen.width * escala))
      canvas.height = Math.max(1, Math.round(imagen.height * escala))
      const contexto = canvas.getContext("2d")
      contexto.fillStyle = "#fff"
      contexto.fillRect(0, 0, canvas.width, canvas.height)
      contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height)
      const datos = canvas.toDataURL("image/jpeg", 0.88)
      if (!datos.startsWith("data:image/")) throw new Error("Imagen invalida")
      escala *= 0.75
      if (escala < 0.05) return datos
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}