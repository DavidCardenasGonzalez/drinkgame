import fs from "fs";

async function extraerTextos() {
  try {
    // Leer el archivo JSON
    const data = fs.readFileSync("registros.json", "utf8");
    const items = JSON.parse(data);

    // Filtrar los items donde info es una cadena vacía y extraer el parámetro text
    const textos = items
      // .filter(item => item.info === "quePrefieresPulgares")
      .map(item => item.text);

    // Unir los textos separados por salto de línea
    const salida = textos.join("\n\n");

    // Escribir la salida en un nuevo archivo de texto
    fs.writeFileSync("tox.txt", salida, "utf8");
    console.log("El archivo 'tox.txt' ha sido creado exitosamente.");
  } catch (error) {
    console.error("Ocurrió un error:", error);
  }
}

extraerTextos();
