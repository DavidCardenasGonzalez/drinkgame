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
import { AWSClients, generateGame } from "../common";

const s3 = AWSClients.s3();
const dynamoDB = AWSClients.dynamoDB();
const categoryTableName = process.env.CATEGORIES_DB_TABLE;
const cardsTableName = process.env.CARDS_DB_TABLE;

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
    TableName: categoryTableName,
    FilterExpression: "#category_status = :status",
    ExpressionAttributeValues: {
      ":status": "active",
    },
    ExpressionAttributeNames: {
      "#category_status": "status",
    },
  };
  console.log(params);
  const results = await dynamoDB.scan(params).promise();
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

const generateCategoryGame = async (request, response) => {
  const { categoriesIds, members } = JSON.parse(request.event.body);
  let categoriesQuestionsArray = [];
  await Promise.all(
    categoriesIds.map(async (categoryId) => {
      const params = {
        TableName: cardsTableName,
        IndexName: "GSI1",
        KeyConditionExpression: "categoryId = :category_id",
        ExpressionAttributeValues: {
          ":category_id": categoryId,
        },
      };
      console.log(params);
      const results = await dynamoDB.query(params).promise();
      console.log(results);
      console.log("results", results.Items);
      categoriesQuestionsArray.push(results.Items);
      console.log(categoriesQuestionsArray);
      console.log("categoriesQuestionsArray", categoriesQuestionsArray.length);
    })
  );
  console.log("categoriesQuestionsArray end", categoriesQuestionsArray.length);
  const game = generateGame(categoriesQuestionsArray, members);
  const mappedCards = await Promise.all(
    game.map(async (category) => {
      if (category.image1) {
        category.imageURL = await getSignedURL(category.image1);
      }
      return category;
    })
  );
  return response.output(mappedCards, 200);
};

const router = createRouter(RouterType.HTTP_API_V2);
router.add(Matcher.HttpApiV2("GET", "/public/categories/"), getAllCategories);

router.add(
  Matcher.HttpApiV2("POST", "/public/generateGame"),
  generateCategoryGame
);

// Lambda Handler
exports.handler = async (event, context) => {
  return router.run(event, context);
};
