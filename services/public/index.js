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
const tableName = process.env.CATEGORIES_DB_TABLE;

// These are JSON schemas that are used to validate requests to the service
// const schemas = {
//   idPathVariable: require("./schemas/idPathVariable.json"),
//   createCategory: require("./schemas/createCategory.json"),
// };
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
  const mappedCategories = await Promise.all(
    results.Items.map(async (category) => {
      if (category.avatar) {
        category.avatarURL = await getSignedURL(category.avatar);
      }
      if (category.background) {
        category.backgroundURL = await getSignedURL(category.background);
      }
      return category;
    })
  );
  return response.output(mappedCategories, 200);
};

const router = createRouter(RouterType.HTTP_API_V2);
router.add(Matcher.HttpApiV2("GET", "/public/categories/"), getAllCategories);
// Lambda Handler
exports.handler = async (event, context) => {
  return router.run(event, context);
};
