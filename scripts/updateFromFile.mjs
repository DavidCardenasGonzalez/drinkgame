import {
    DynamoDBClient,
    UpdateItemCommand,
  } from "@aws-sdk/client-dynamodb";
  import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
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
  
  async function actualizarRegistros() {
    try {
      // Leer el archivo JSON
      const data = fs.readFileSync("registros.json");
      const items = JSON.parse(data);
  
      for (const item of items) {
        const { categoryId, PK, ...rest } = item; // Asegúrate de incluir la clave de partición y cualquier clave de clasificación
        console.log(`Actualizando registro con categoryId ${categoryId} y PK ${PK}.`);
        // Actualizar el registro en DynamoDB
        const updateParams = {
          TableName: tableName,
          Key: marshall({ categoryId, PK }), // Ajusta esto si tienes una clave de clasificación diferente
          UpdateExpression: "SET " + Object.keys(rest).map((key, index) => `#field${index} = :value${index}`).join(", "),
          ExpressionAttributeNames: Object.keys(rest).reduce((acc, key, index) => {
            acc[`#field${index}`] = key;
            return acc;
          }, {}),
          ExpressionAttributeValues: marshall(Object.keys(rest).reduce((acc, key, index) => {
            acc[`:value${index}`] = rest[key];
            return acc;
          }, {})),
        };
  
        const updateCommand = new UpdateItemCommand(updateParams);
        await dynamodbClient.send(updateCommand);
  
        console.log(`Registro con categoryId ${categoryId} y PK ${PK} modificado.`);
      }
  
      console.log("Todos los registros han sido actualizados exitosamente.");
    } catch (error) {
      console.error("Ocurrió un error:", error);
    }
  }
  
  // Llamar a la función para iniciar el proceso de actualización
  actualizarRegistros();
  