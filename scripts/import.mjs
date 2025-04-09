import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { readFileSync } from "fs";
import KSUID from "ksuid";
import { fromIni } from "@aws-sdk/credential-providers";

const region = "us-west-2"; // Reemplaza 'us-west-2' con la región en la que se encuentra tu tabla
const awsProfileName = "david";
const credentials = fromIni({
  profile: awsProfileName,
});
// Configura el cliente de DynamoDB con el perfil especificado
const dynamodbClient = new DynamoDBClient({
  region: region,
  credentials: credentials,
});

const tableName = "Bodazen-DatabaseCardTableAEE1226B-12G6AZZGEINOX";

async function modificarRegistros() {
  try {
    // Leer el archivo de texto
    const data = readFileSync("import.txt", "utf-8");
    const registros = data.split("\n\n"); // Separar registros por líneas en blanco

    // Iterar sobre cada registro y modificar la tabla
    for (const registro of registros) {
      // const array = registro.split(" /respuesta/ ");
      // console.log(array);
      const registroEjemplo = {
        PK: KSUID.randomSync().string,
        categoryId: "2v6Y5OXroYvvWQAHS6e005rCh3V",
        date: new Date().toISOString(),
        info: "encuestaDeDedos",
        // duration: 2,
        status: "active",
        text: registro,
        text2: "",
        // text: array[0],
        // passcode: array[1],
        type: "text",
        lote: "47",
        // info: "passcode",
      };
      
      console.log(registroEjemplo);
      await insertarRegistro(registroEjemplo);
    }
    console.log("Todos los registros han sido modificados exitosamente.");
  } catch (error) {
    console.error("Ocurrió un error:", error);
  }
}

async function insertarRegistro(registro) {
  try {
    // Insertar el registro en la tabla
    const putParams = {
      TableName: tableName,
      Item: marshall(registro),
    };
    const putCommand = new PutItemCommand(putParams);
    await dynamodbClient.send(putCommand);

    console.log(`Registro insertado.`);
  } catch (error) {
    console.error("Ocurrió un error:", error);
  }
}

// Llamar a la función para iniciar el proceso de modificación
modificarRegistros();
