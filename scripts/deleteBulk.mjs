import {
    DynamoDBClient,
    DeleteItemCommand,
  } from "@aws-sdk/client-dynamodb";
  import { marshall } from "@aws-sdk/util-dynamodb";
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
  
  async function eliminarRegistros() {
    try {
      // Leer el archivo JSON
      const data = fs.readFileSync("registros.json");
      const items = JSON.parse(data);
  
      for (const item of items) {
        if (item.type === "delete") {
          const { categoryId, PK } = item; // Asegúrate de incluir la clave de partición y cualquier clave de clasificación
  
          // Eliminar el registro en DynamoDB
          const deleteParams = {
            TableName: tableName,
            Key: marshall({ categoryId, PK }), // Ajusta esto si tienes una clave de clasificación diferente
          };
  
          const deleteCommand = new DeleteItemCommand(deleteParams);
          await dynamodbClient.send(deleteCommand);
  
          console.log(`Registro con categoryId ${categoryId} y PK ${PK} eliminado.`);
        }
      }
  
      console.log("Todos los registros marcados para eliminación han sido eliminados exitosamente.");
    } catch (error) {
      console.error("Ocurrió un error:", error);
    }
  }
  
  // Llamar a la función para iniciar el proceso de eliminación
  eliminarRegistros();
  