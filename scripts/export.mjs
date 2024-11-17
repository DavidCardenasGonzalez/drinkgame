import {
    DynamoDBClient,
    QueryCommand,
  } from "@aws-sdk/client-dynamodb";
  import { unmarshall } from "@aws-sdk/util-dynamodb";
  import { fromIni } from "@aws-sdk/credential-providers"; // ES6 import
  import fs from "fs";
  
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
  
  async function exportarRegistros() {
    try {
      // Escanear la tabla para obtener todos los registros
      const queryCommand = new QueryCommand({
        TableName: tableName,
        IndexName: "GSI1", // Asegúrate de que el índice esté correctamente configurado
        KeyConditionExpression: "categoryId = :category_id",
        ExpressionAttributeValues: {
          ":category_id": { S: '2VrJbLSDL1mJ6AESPoxxoGHZysi' },
        },
      });
      const queryResult = await dynamodbClient.send(queryCommand);
      console.log("Registros obtenidos:", queryResult.Items.length);
  
      // Desempaquetar los registros
      const items = queryResult.Items.map((item) => unmarshall(item));
  
      // Guardar los registros en un archivo JSON
      fs.writeFileSync("registros.json", JSON.stringify(items, null, 2));
  
      console.log("Todos los registros han sido exportados exitosamente.");
    } catch (error) {
      console.error("Ocurrió un error:", error);
    }
  }
  
  // Llamar a la función para iniciar el proceso de exportación
  exportarRegistros();
  