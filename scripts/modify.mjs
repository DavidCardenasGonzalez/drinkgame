import {
  DynamoDBClient,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import { fromIni } from "@aws-sdk/credential-providers"; // ES6 import

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

const tableName = "Bodazen-DatabaseCardTableAEE1226B-12G6AZZGEINOX"; // Reemplaza 'nombre_de_tu_tabla' con el nombre real de tu tabla

async function modificarRegistros() {
  try {
    // Escanear la tabla para obtener todos los registros
    const scanCommand = new ScanCommand({ TableName: tableName });
    const scanResult = await dynamodbClient.send(scanCommand);
    console.log("Registros obtenidos:", scanResult.Items.length);
    // Iterar sobre cada elemento y modificarlo
    for (const item of scanResult.Items) {
      const itemId = unmarshall(item).PK;
      const categoryId = unmarshall(item).categoryId;

      // Reemplazar "{men}" por "{{men}}"
      if (unmarshall(item).text.includes("{men},")) {
        console.log(unmarshall(item));
        const nuevoTexto = unmarshall(item).text.replace("{men},", "{{men}},");
        console.log(nuevoTexto);
        // Actualizar el elemento modificado en la tabla
        const updateParams = {
          TableName: tableName,
          Key: marshall({ PK: itemId, categoryId: categoryId }),
          UpdateExpression: "SET #textFiel = :nuevoText", 
          ExpressionAttributeNames: {
            "#textFiel": "text",
          },
          ExpressionAttributeValues: marshall({ ":nuevoText": nuevoTexto }),
        };
        console.log(updateParams);
        const updateCommand = new UpdateItemCommand(updateParams);
        await dynamodbClient.send(updateCommand);

        console.log(`Registro con ID ${itemId} modificado.`);
      }
    }

    console.log("Todos los registros han sido modificados exitosamente.");
  } catch (error) {
    console.error("Ocurrió un error:", error);
  }
}

// Llamar a la función para iniciar el proceso de modificación
modificarRegistros();
