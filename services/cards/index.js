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
import { AWSClients, generateID, generateUpdateExpressions } from "../common";
const s3 = AWSClients.s3();
const dynamoDB = AWSClients.dynamoDB();
const tableName = process.env.DYNAMO_DB_TABLE;

// These are JSON schemas that are used to validate requests to the service
const schemas = {
  idPathVariable: require("./schemas/idPathVariable.json"),
  categoryIdPathVariable: require("./schemas/categoryIdPathVariable.json"),
  createCard: require("./schemas/createCard.json"),
};
//------------------------------------------------------------------------
// UTILITY FUNCTIONS
//------------------------------------------------------------------------

const getSignedURL = async (picture) => {
  const urlExpirySeconds = 60 * 60 * 24; // One day
  const params = {
    Bucket: process.env.ASSET_BUCKET,
    Key: picture,
    Expires: urlExpirySeconds,
  };
  const signedURL = await s3.getSignedUrlPromise("getObject", params);
  return signedURL;
};

const uploadPhotoToS3 = async (id, type, formFile) => {
  const params = {
    Bucket: process.env.ASSET_BUCKET,
    Key: `cards/${id}/${type}${path.extname(formFile.fileName)}`,
    Body: formFile.content,
    ContentType: formFile.contentType,
  };
  console.log(params);
  return s3.upload(params).promise();
};

//------------------------------------------------------------------------
// SERVICE FUNCTIONS
//------------------------------------------------------------------------

// Get all documents
const getAllCards = async (request, response) => {
  console.log("getAllCards");
  const params = {
    TableName: tableName,
    IndexName: "GSI1",
    KeyConditionExpression: "#category_status = :status ",
    ExpressionAttributeValues: {
      ":status": "active",
    },
    ExpressionAttributeNames: {
      "#category_status": "status",
    },
  };
  console.log(params);
  const results = await dynamoDB.query(params).promise();
  return response.output(results.Items, 200);
};

const getCard = async (request, response) => {
  const categoryId = request.pathVariables.id;
  console.log(categoryId);
  const params = {
    TableName: tableName,
    KeyConditionExpression: "PK = :key",
    ExpressionAttributeValues: {
      ":key": categoryId,
    },
  };
  const results = await dynamoDB.query(params).promise();
  const category = results.Items[0];
  if (category.image1) {
    category.image1URL = await getSignedURL(category.image1);
  }
  if (category.image2) {
    category.image2URL = await getSignedURL(category.image2);
  }
  return response.output(category, 200);
};

const getCategoryCards = async (request, response) => {
  const categoryId = request.pathVariables.categoryId;

  const params = {
    TableName: tableName,
    IndexName: "GSI1",
    KeyConditionExpression: "categoryId = :category_id",
    ExpressionAttributeValues: {
      ":category_id": categoryId,
    },
  };
  console.log(params);
  const results = await dynamoDB.query(params).promise();
  return response.output(results.Items, 200);
};

const createCard = async (request, response) => {
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
    const categoryId = generateID();
    const item = {
      ...fields,
      PK: categoryId,
      status: "active",
      date: new Date().toISOString(),
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

const updateCardPicture = async (request, response) => {
  const { fields } = request.formData;

  // Check if we need to delete photo
  if (fields && fields.deletePicture) {
    const params = {
      TableName: tableName,
      KeyConditionExpression: "PK = :key",
      ExpressionAttributeValues: {
        ":key": fields.PK,
      },
    };
    const results = await dynamoDB.query(params).promise();
    const category = results.Items[0];
    const photoKey =
      fields.type == "image1" ? category.image1 : category.image2;
    console.log(photoKey);
    // Delete file
    if (photoKey) {
      const deleteParams = {
        Bucket: process.env.ASSET_BUCKET,
        Key: photoKey,
      };
      await s3.deleteObject(deleteParams).promise();
    }
    const expressions = generateUpdateExpressions(
      fields.type == "image1"
        ? {
            image1: '',
          }
        : {
            image2: '',
          }
    );
    const updateParams = {
      TableName: tableName,
      Key: {
        PK: fields.PK,
        categoryId: fields.categoryId,
      },
      UpdateExpression: expressions.updateExpression,
      ExpressionAttributeValues: expressions.expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };
    await dynamoDB.update(updateParams).promise();
  }

  // Check to see if we need to upload picture
  let formFile;
  if (request.formData.files && request.formData.files[0]) {
    [formFile] = request.formData.files;
    await uploadPhotoToS3(fields.PK, fields.type, formFile);
  }

  // Check to See if we need to update name in cognito
  if (fields && fields.PK) {
    const expressions = generateUpdateExpressions(
      fields.type == "image1"
        ? {
            image1: `cards/${fields.PK}/${fields.type}${path.extname(
              formFile.fileName
            )}`,
          }
        : {
            image2: `cards/${fields.PK}/${fields.type}${path.extname(
              formFile.fileName
            )}`,
          }
    );
    const updateParams = {
      TableName: tableName,
      Key: {
        PK: fields.PK,
        categoryId: fields.categoryId,
      },
      UpdateExpression: expressions.updateExpression,
      ExpressionAttributeValues: expressions.expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };
    await dynamoDB.update(updateParams).promise();
  }

  // Return current user after updates
  return response.output({}, 200);
};

const deleteCard = async (request, response) => {
  const cardId = request.pathVariables.id;
  const categoryId = request.pathVariables.categoryId;
  const params = {
    TableName: tableName,
    Key: {
      PK: cardId,
      categoryId,
    },
  };
  console.log(params);
  await dynamoDB.delete(params).promise();
  return response.output({}, 200);
}
//------------------------------------------------------------------------
// LAMBDA ROUTER
//------------------------------------------------------------------------

const router = createRouter(RouterType.HTTP_API_V2);
router.add(
  Matcher.HttpApiV2("GET", "/cards/"),
  enforceGroupMembership(["admin", "manager"]),
  getAllCards
);
router.add(
  Matcher.HttpApiV2("POST", "/cards/"),
  enforceGroupMembership(["admin", "manager"]),
  validateBodyJSONVariables(schemas.createCard),
  createCard
);
router.add(
  Matcher.HttpApiV2("GET", "/cards(/:id)"),
  enforceGroupMembership("admin", "manager"),
  validatePathVariables(schemas.idPathVariable),
  getCard
);

router.add(
  Matcher.HttpApiV2("GET", "/cards/category(/:categoryId)"),
  enforceGroupMembership("admin", "manager"),
  validatePathVariables(schemas.categoryIdPathVariable),
  getCategoryCards
);

router.add(
  Matcher.HttpApiV2("PATCH", "/cards/actions/updatePicture"),
  parseMultipartFormData,
  updateCardPicture
);

router.add(
  Matcher.HttpApiV2('DELETE', '/cards(/:id)/category(/:categoryId)'),
  enforceGroupMembership('admin'),
  validatePathVariables(schemas.idPathVariable),
  deleteCard,
);

// Lambda Handler
exports.handler = async (event, context) => {
  return router.run(event, context);
};
