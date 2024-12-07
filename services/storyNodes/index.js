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
  storyIdPathVariable: require("./schemas/storyIdPathVariable.json"),
  createStoryNode: require("./schemas/createStoryNode.json"),
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
    Key: `storyNodes/${id}/${type}${path.extname(formFile.fileName)}`,
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
const getAllStoryNodes = async (request, response) => {
  console.log("getAllStoryNodes");
  const params = {
    TableName: tableName,
    IndexName: "GSI1",
    KeyConditionExpression: "#story_status = :status ",
    ExpressionAttributeValues: {
      ":status": "active",
    },
    ExpressionAttributeNames: {
      "#story_status": "status",
    },
  };
  console.log(params);
  const results = await dynamoDB.query(params).promise();
  return response.output(results.Items, 200);
};

const getStoryNode = async (request, response) => {
  const storyId = request.pathVariables.id;
  console.log(storyId);
  const params = {
    TableName: tableName,
    KeyConditionExpression: "PK = :key",
    ExpressionAttributeValues: {
      ":key": storyId,
    },
  };
  const results = await dynamoDB.query(params).promise();
  const story = results.Items[0];
  if (story.image1) {
    story.image1URL = await getSignedURL(story.image1);
  }
  if (story.image2) {
    story.image2URL = await getSignedURL(story.image2);
  }
  return response.output(story, 200);
};

const getStoryStoryNodes = async (request, response) => {
  const storyId = request.pathVariables.storyId;

  const params = {
    TableName: tableName,
    IndexName: "GSI1",
    KeyConditionExpression: "storyId = :story_id",
    ExpressionAttributeValues: {
      ":story_id": storyId,
    },
  };
  console.log(params);
  const results = await dynamoDB.query(params).promise();
  return response.output(results.Items, 200);
};

const createStoryNode = async (request, response) => {
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

const updateStoryNodePicture = async (request, response) => {
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
    const story = results.Items[0];
    const photoKey =
      fields.type == "image1" ? story.image1 : story.image2;
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
        storyId: fields.storyId,
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
            image1: `storyNodes/${fields.PK}/${fields.type}${path.extname(
              formFile.fileName
            )}`,
          }
        : {
            image2: `storyNodes/${fields.PK}/${fields.type}${path.extname(
              formFile.fileName
            )}`,
          }
    );
    const updateParams = {
      TableName: tableName,
      Key: {
        PK: fields.PK,
        storyId: fields.storyId,
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

const deleteStoryNode = async (request, response) => {
  const cardId = request.pathVariables.id;
  const storyId = request.pathVariables.storyId;
  const params = {
    TableName: tableName,
    Key: {
      PK: cardId,
      storyId,
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
  Matcher.HttpApiV2("GET", "/storyNodes/"),
  enforceGroupMembership(["admin", "manager"]),
  getAllStoryNodes
);
router.add(
  Matcher.HttpApiV2("POST", "/storyNodes/"),
  enforceGroupMembership(["admin", "manager"]),
  validateBodyJSONVariables(schemas.createStoryNode),
  createStoryNode
);
router.add(
  Matcher.HttpApiV2("GET", "/storyNodes(/:id)"),
  enforceGroupMembership("admin", "manager"),
  validatePathVariables(schemas.idPathVariable),
  getStoryNode
);

router.add(
  Matcher.HttpApiV2("GET", "/storyNodes/story(/:storyId)"),
  enforceGroupMembership("admin", "manager"),
  validatePathVariables(schemas.storyIdPathVariable),
  getStoryStoryNodes
);

router.add(
  Matcher.HttpApiV2("PATCH", "/storyNodes/actions/updatePicture"),
  parseMultipartFormData,
  updateStoryNodePicture
);

router.add(
  Matcher.HttpApiV2('DELETE', '/storyNodes(/:id)/story(/:storyId)'),
  enforceGroupMembership('admin'),
  validatePathVariables(schemas.idPathVariable),
  deleteStoryNode,
);

// Lambda Handler
exports.handler = async (event, context) => {
  return router.run(event, context);
};
