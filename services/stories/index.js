import path from "path";
import {
  enforceGroupMembership,
  createRouter,
  validatePathVariables,
  parseMultipartFormData,
  validateBodyJSONVariables,
  RouterType,
  Matcher,
} from "lambda-micro";
import {
  AWSClients,
  generateID,
  generateUpdateExpressions,
  generateGame, // Si es necesario para historias
} from "../common";

// Obtener el ID del User Pool
const userPoolId = process.env.USER_POOL_ID;
const cisp = AWSClients.cisp();
const s3 = AWSClients.s3();
const dynamoDB = AWSClients.dynamoDB();
const tableName = process.env.DYNAMO_DB_TABLE;
const storyNodesTableName = process.env.STORY_NODES_DB_TABLE; // Añadir si es necesario

// Esquemas JSON para validar las solicitudes al servicio
const schemas = {
  idPathVariable: require("./schemas/idPathVariable.json"),
  createStory: require("./schemas/createStory.json"), // Crear un nuevo esquema para historias
};

//------------------------------------------------------------------------
// FUNCIONES UTILITARIAS
//------------------------------------------------------------------------

/**
 * Obtiene una URL firmada para acceder a un archivo en S3.
 * @param {string} picture - Ruta del archivo en S3.
 * @returns {Promise<string>} - URL firmada.
 */
const getSignedURL = async (picture) => {
  const urlExpirySeconds = 60 * 60 * 24; // Un día
  const params = {
    Bucket: process.env.ASSET_BUCKET,
    Key: picture,
    Expires: urlExpirySeconds,
  };
  const signedURL = await s3.getSignedUrlPromise("getObject", params);
  return signedURL;
};

/**
 * Sube una imagen a S3.
 * @param {string} id - ID de la historia.
 * @param {string} type - Tipo de imagen (e.g., cover).
 * @param {object} formFile - Archivo de formulario.
 * @returns {Promise<object>} - Resultado de la subida.
 */
const uploadPhotoToS3 = async (id, type, formFile) => {
  const params = {
    Bucket: process.env.ASSET_BUCKET,
    Key: `story/${id}/${type}${path.extname(formFile.fileName)}`,
    Body: formFile.content,
    ContentType: formFile.contentType,
  };
  console.log(params);
  return s3.upload(params).promise();
};

//------------------------------------------------------------------------
// FUNCIONES DEL SERVICIO
//------------------------------------------------------------------------

/**
 * Obtiene todas las historias.
 * @param {object} request - Objeto de solicitud.
 * @param {object} response - Objeto de respuesta.
 * @returns {object} - Respuesta HTTP.
 */
const getAllStories = async (request, response) => {
  console.log("getAllStories");
  const params = {
    TableName: tableName,
  };
  console.log(params);
  const results = await dynamoDB.scan(params).promise();
  return response.output(results.Items, 200);
};

/**
 * Obtiene una historia específica por ID.
 * @param {object} request - Objeto de solicitud.
 * @param {object} response - Objeto de respuesta.
 * @returns {object} - Respuesta HTTP.
 */
const getStory = async (request, response) => {
  const storyId = request.pathVariables.id;
  console.log(storyId);
  const params = {
    TableName: tableName,
    KeyConditionExpression: "PK = :key",
    ExpressionAttributeValues: {
      ":key": categoryId,
    },
  };
  const results = await dynamoDB.get(params).promise();
  const story = results.Item;
  if (story.coverImage) {
    story.coverImageURL = await getSignedURL(story.coverImage);
  }
  // Si deseas incluir más imágenes o atributos, agrégalos aquí
  return response.output(story, 200);
};

/**
 * Crea una nueva historia.
 * @param {object} request - Objeto de solicitud.
 * @param {object} response - Objeto de respuesta.
 * @returns {object} - Respuesta HTTP.
 */
const createStory = async (request, response) => {
  const fields = JSON.parse(request.event.body);
  console.log(fields);
  if (fields.PK) {
    const params = {
      TableName: tableName,
      Item: fields,
      ReturnValues: "NONE",
    };
    await dynamoDB.put(params).promise();
    return response.output({}, 200);
  } else {
    const storyId = generateID();
    const item = {
      ...fields,
      PK: storyId,
      status: fields.status ?? "active",
      createdAt: new Date().toISOString(),
    };
    const params = {
      TableName: tableName,
      Item: item,
      ReturnValues: "NONE",
    };
    await dynamoDB.put(params).promise();
    return response.output({}, 200);
  }
};

/**
 * Simula una historia (si es aplicable).
 * @param {object} request - Objeto de solicitud.
 * @param {object} response - Objeto de respuesta.
 * @returns {object} - Respuesta HTTP.
 */
const simulateStory = async (request, response) => {
  const { storyId, members } = JSON.parse(request.event.body);

  const params = {
    TableName: storyNodesTableName,
    IndexName: "GSI1", // Asegúrate de que este índice existe
    KeyConditionExpression: "storyId = :story_id",
    ExpressionAttributeValues: {
      ":story_id": storyId,
    },
  };
  console.log(params);
  const results = await dynamoDB.query(params).promise();

  // Implementa la lógica de simulación según tus necesidades
  const game = generateGame([results.Items], members);
  return response.output(game, 200);
};

/**
 * Actualiza la imagen de una historia.
 * @param {object} request - Objeto de solicitud.
 * @param {object} response - Objeto de respuesta.
 * @returns {object} - Respuesta HTTP.
 */
const updateStoryPicture = async (request, response) => {
  const { fields } = request.formData;

  // Verifica si necesitamos eliminar la imagen
  if (fields && fields.deletePicture) {
    const params = {
      TableName: tableName,
      KeyConditionExpression: "PK = :key",
      ExpressionAttributeValues: {
        ":key": fields.PK,
      },
    };
    const results = await dynamoDB.get(params).promise();
    const story = results.Item;
    const photoKey = fields.type === "coverImage" ? story.coverImage : ""; // Ajusta según tus tipos
    console.log(photoKey);
    // Eliminar archivo
    if (photoKey) {
      const deleteParams = {
        Bucket: process.env.ASSET_BUCKET,
        Key: photoKey,
      };
      await s3.deleteObject(deleteParams).promise();
    }
    const expressions = generateUpdateExpressions(
      fields.type === "coverImage"
        ? {
            coverImage: "",
          }
        : {}
      // Añade más tipos si es necesario
    );
    const updateParams = {
      TableName: tableName,
      Key: {
        PK: fields.PK,
        status: fields.status,
      },
      UpdateExpression: expressions.updateExpression,
      ExpressionAttributeValues: expressions.expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };
    await dynamoDB.update(updateParams).promise();
  }

  // Verifica si necesitamos subir una nueva imagen
  let formFile;
  if (request.formData.files && request.formData.files[0]) {
    [formFile] = request.formData.files;
    await uploadPhotoToS3(fields.storyId, fields.type, formFile);
  }

  // Actualiza la referencia de la imagen en DynamoDB
  if (fields && fields.storyId) {
    const expressions = generateUpdateExpressions(
      fields.type === "coverImage"
        ? {
            coverImage: `story/${fields.storyId}/${fields.type}${path.extname(
              formFile.fileName
            )}`,
          }
        : {}
      // Añade más tipos si es necesario
    );
    const updateParams = {
      TableName: tableName,
      Key: {
        storyId: fields.storyId,
        SK: "#METADATA",
      },
      UpdateExpression: expressions.updateExpression,
      ExpressionAttributeValues: expressions.expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };
    await dynamoDB.update(updateParams).promise();
  }

  // Retorna la historia actualizada después de las actualizaciones
  return response.output({}, 200);
};

/**
 * Elimina una historia específica.
 * @param {object} request - Objeto de solicitud.
 * @param {object} response - Objeto de respuesta.
 * @returns {object} - Respuesta HTTP.
 */
const deleteStory = async (request, response) => {
  const storyId = request.pathVariables.id;
  const params = {
    TableName: tableName,
    Key: {
      PK: storyId,
    },
  };
  console.log(params);
  await dynamoDB.delete(params).promise();
  return response.output({}, 200);
};

//------------------------------------------------------------------------
// ROUTER DE LAMBDA
//------------------------------------------------------------------------

const router = createRouter(RouterType.HTTP_API_V2);

// Rutas para obtener todas las historias
router.add(
  Matcher.HttpApiV2("GET", "/stories/"),
  enforceGroupMembership(["admin", "manager"]),
  getAllStories
);

// Rutas para crear una nueva historia
router.add(
  Matcher.HttpApiV2("POST", "/stories/"),
  enforceGroupMembership(["admin", "manager"]),
  validateBodyJSONVariables(schemas.createStory),
  createStory
);

// Rutas para obtener una historia específica
router.add(
  Matcher.HttpApiV2("GET", "/stories(/:id)"),
  enforceGroupMembership(["admin", "manager"]),
  validatePathVariables(schemas.idPathVariable),
  getStory
);

// Rutas para simular una historia (si aplica)
router.add(
  Matcher.HttpApiV2("POST", "/stories/actions/simulate"),
  enforceGroupMembership(["admin", "manager"]),
  simulateStory
);

// Rutas para actualizar la imagen de una historia
router.add(
  Matcher.HttpApiV2("PATCH", "/stories/actions/updatePicture"),
  parseMultipartFormData,
  updateStoryPicture
);

// Rutas para eliminar una historia específica
router.add(
  Matcher.HttpApiV2("DELETE", "/stories(/:id)"),
  enforceGroupMembership(["admin"]),
  validatePathVariables(schemas.idPathVariable),
  deleteStory
);

// Handler de Lambda
exports.handler = async (event, context) => {
  return router.run(event, context);
};
