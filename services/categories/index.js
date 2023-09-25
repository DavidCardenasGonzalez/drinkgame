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

// Get the User Pool ID
const userPoolId = process.env.USER_POOL_ID;
const cisp = AWSClients.cisp();
const s3 = AWSClients.s3();
const dynamoDB = AWSClients.dynamoDB();
const tableName = process.env.DYNAMO_DB_TABLE;

// These are JSON schemas that are used to validate requests to the service
const schemas = {
  idPathVariable: require("./schemas/idPathVariable.json"),
  createCategory: require("./schemas/createCategory.json"),
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
    Key: `category/${id}/${type}${path.extname(formFile.fileName)}`,
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
const getAllCategories = async (request, response) => {
  console.log("getAllCategories");
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

const getCategory = async (request, response) => {
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
  if (category.avatar) {
    category.avatarURL = await getSignedURL(category.avatar);
  }
  if (category.background) {
    category.backgroundURL = await getSignedURL(category.background);
  }
  return response.output(category, 200);
};

const createCategory = async (request, response) => {
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

const updateCategoryPicture = async (request, response) => {
  const { fields } = request.formData;

  // Check if we need to delete photo
  if (fields && fields.deletePicture) {
    const params = {
      TableName: tableName,
      KeyConditionExpression: "PK = :key",
      ExpressionAttributeValues: {
        ":key": categoryId,
      },
    };
    const results = await dynamoDB.query(params).promise();
    const category = results.Items[0];
    const photoKey =
      fields.type == "avatar" ? category.avatar : category.background;
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
      fields.type == "avatar"
        ? {
            avatar: '',
          }
        : {
            background: '',
          }
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

  // Check to see if we need to upload picture
  let formFile;
  if (request.formData.files && request.formData.files[0]) {
    [formFile] = request.formData.files;
    await uploadPhotoToS3(fields.PK, fields.type, formFile);
  }

  // Check to See if we need to update name in cognito
  if (fields && fields.PK) {
    const expressions = generateUpdateExpressions(
      fields.type == "avatar"
        ? {
            avatar: `category/${fields.PK}/${fields.type}${path.extname(
              formFile.fileName
            )}`,
          }
        : {
            background: `category/${fields.PK}/${fields.type}${path.extname(
              formFile.fileName
            )}`,
          }
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

  // Return current user after updates
  return response.output({}, 200);
};
//------------------------------------------------------------------------
// LAMBDA ROUTER
//------------------------------------------------------------------------

const router = createRouter(RouterType.HTTP_API_V2);
router.add(
  Matcher.HttpApiV2("GET", "/categories/"),
  enforceGroupMembership(["admin", "manager"]),
  getAllCategories
);
router.add(
  Matcher.HttpApiV2("POST", "/categories/"),
  enforceGroupMembership(["admin", "manager"]),
  validateBodyJSONVariables(schemas.createCategory),
  createCategory
);
router.add(
  Matcher.HttpApiV2("GET", "/categories(/:id)"),
  enforceGroupMembership("admin", "manager"),
  validatePathVariables(schemas.idPathVariable),
  getCategory
);

router.add(
  Matcher.HttpApiV2("PATCH", "/categories/actions/updatePicture"),
  parseMultipartFormData,
  updateCategoryPicture
);

// router.add(
//   Matcher.HttpApiV2('DELETE', '/categories(/:id)'),
//   enforceGroupMembership('admin'),
//   validatePathVariables(schemas.idPathVariable),
//   deleteUser,
// );

// Lambda Handler
exports.handler = async (event, context) => {
  return router.run(event, context);
};
