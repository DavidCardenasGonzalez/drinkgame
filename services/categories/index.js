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
import { AWSClients, generateID } from "../common";

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


const getUserAttribute = (user, attrName, defaultVal) => {
  const attrProperty = Object.prototype.hasOwnProperty.call(user, "Attributes")
    ? "Attributes"
    : "UserAttributes";
  const attr = user[attrProperty].find((a) => a.Name === attrName);
  if (!attr) {
    return defaultVal;
  }
  return attr.Value;
};

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

const uploadPhotoToS3 = async (id, formFile) => {
  const params = {
    Bucket: process.env.ASSET_BUCKET,
    Key: `profile/${id}${path.extname(formFile.fileName)}`,
    Body: formFile.content,
    ContentType: formFile.contentType,
  };
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
  return response.output(category, 200);
};

const createCategory = async (request, response) => {
  const fields = JSON.parse(request.event.body);
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
