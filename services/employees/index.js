import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
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
  createEmployee: require("./schemas/createEmployee.json"),
};

const groups = ["admin", "manager", "employee"];

//------------------------------------------------------------------------
// UTILITY FUNCTIONS
//------------------------------------------------------------------------

const doesOutputHaveUser = (output, user) => {
  const foundUser = output.find(
    (existingUser) => existingUser.userId === user.userId
  );
  if (foundUser) {
    return true;
  }
  return false;
};

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

const transformUser = async (user) => {
  const output = {};
  output.userId = user.Username;
  output.dateCreated = user.UserCreateDate;
  output.name = getUserAttribute(user, "name", "");
  output.email = getUserAttribute(user, "email", "");
  output.picture = getUserAttribute(user, "picture", "");
  if (output.picture) {
    output.pictureURL = await getSignedURL(output.picture);
  }
  return output;
};

const getUsersInGroup = async (groupName, nextToken) => {
  const params = {
    GroupName: groupName,
    UserPoolId: userPoolId,
    Limit: 60,
  };
  if (nextToken) {
    params.NextToken = nextToken;
  }
  const result = await cisp.listUsersInGroup(params).promise();
  let employees = result.Users;
  if (result.NextToken) {
    employees = [
      ...employees,
      await getUsersInGroup(groupName, result.NextToken),
    ];
  }
  return employees;
};

const getUsersInAllGroups = async () => {
  const output = [];
  await Promise.all(
    groups.map(async (group) => {
      const employees = await getUsersInGroup(group);
      employees.map(async (user) => {
        const transformedUser = await transformUser(user);
        transformedUser.group = group;
        if (!doesOutputHaveUser(output, transformedUser)) {
          output.push(transformedUser);
        }
      });
    })
  );
  return output;
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
const getAllEmployees = async (request, response) => {
  const params = {
    TableName: tableName,
    IndexName: "GSI1",
    KeyConditionExpression: "#employee_status = :status ",
    ExpressionAttributeValues: {
      ":status": "active",
    },
    ExpressionAttributeNames: {
      "#employee_status": "status",
    },
  };
  const results = await dynamoDB.query(params).promise();
  return response.output(results.Items, 200);
};

const getEmployee = async (request, response) => {
  const employeeId = request.pathVariables.id;
  console.log(employeeId);
  const params = {
    TableName: tableName,
    KeyConditionExpression: "PK = :key",
    ExpressionAttributeValues: {
      ":key": employeeId,
    },
  };
  const results = await dynamoDB.query(params).promise();
  const employee = results.Items[0];
  return response.output(employee, 200);
};

const getContract = async (request, response) => {
  const employeeId = request.pathVariables.id;
  const paramsEmployee = {
    TableName: tableName,
    KeyConditionExpression: "PK = :key",
    ExpressionAttributeValues: {
      ":key": employeeId,
    },
  };
  const results = await dynamoDB.query(paramsEmployee).promise();
  const employee = results.Items[0];

  const bucket = process.env.ASSET_BUCKET;
  const key = decodeURIComponent("contrato.docx");
  const params = {
    Bucket: bucket,
    Key: key,
  };
  try {
    const format = await s3.getObject(params).promise();
    const zip = new PizZip(format.Body);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render({
      nombre: employee.name,
      apellido: employee.lastname,
      correo: employee.email,
    });

    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });
    return response.output(buf, 200);
  } catch (err) {
    console.log(err);
    return response.output({}, 400);
  }
};

const getCurrentUser = async (request, response) => {
  const userId = request.event.requestContext.authorizer.jwt.claims.username;
  const params = {
    UserPoolId: userPoolId,
    Username: userId,
  };
  const rawUser = await cisp.adminGetUser(params).promise();
  if (!rawUser) {
    return response.output({}, 404);
  }
  const user = await transformUser(rawUser);
  return response.output({ user }, 200);
};

const updateCurrentUser = async (request, response) => {
  const userId = request.event.requestContext.authorizer.jwt.claims.username;
  const { fields } = request.formData;

  // Check if we need to delete photo
  if (fields && fields.deletePicture) {
    const userParams = {
      UserPoolId: userPoolId,
      Username: userId,
    };
    const rawUser = await cisp.adminGetUser(userParams).promise();
    const photoKey = getUserAttribute(rawUser, "picture");
    // Delete file
    if (photoKey) {
      const deleteParams = {
        Bucket: process.env.ASSET_BUCKET,
        Key: photoKey,
      };
      await s3.deleteObject(deleteParams).promise();
    }
    // Delete attribute
    const attributeParams = {
      UserAttributeNames: ["picture"],
      UserPoolId: userPoolId,
      Username: userId,
    };
    await cisp.adminDeleteUserAttributes(attributeParams).promise();
  }

  // Check to see if we need to upload picture
  let formFile;
  if (request.formData.files && request.formData.files[0]) {
    [formFile] = request.formData.files;
    await uploadPhotoToS3(userId, formFile);
  }

  // Check to See if we need to update name in cognito
  if (fields && fields.name) {
    const params = {
      UserPoolId: userPoolId,
      Username: userId,
      UserAttributes: [
        {
          Name: "name",
          Value: fields.name,
        },
      ],
    };
    if (formFile) {
      params.UserAttributes.push({
        Name: "picture",
        Value: `profile/${userId}${path.extname(formFile.fileName)}`,
      });
    }
    await cisp.adminUpdateUserAttributes(params).promise();
  }

  // Return current user after updates
  return getCurrentUser(request, response);
};

// const getAllProfiles = async (request, response) => {
//   const employees = await getUsersInAllGroups();
//   const output = employees.map((user) => {
//     return {
//       userId: user.userId,
//       name: user.name,
//       pictureURL: user.pictureURL,
//     };
//   });
//   return response.output({ employees: output }, 200);
// };

// const deleteUser = async (request, response) => {
//   const userId = request.pathVariables.id;
//   const params = {
//     UserPoolId: userPoolId,
//     Username: userId,
//   };
//   await cisp.adminDeleteUser(params).promise();
//   return response.output("User Deleted", 200);
// };

const createEmployee = async (request, response) => {
  const fields = JSON.parse(request.event.body);
  // Create User
  const createUserParams = {
    UserPoolId: userPoolId,
    Username: fields.email,
    TemporaryPassword: fields.password,
    UserAttributes: [
      {
        Name: "name",
        Value: fields.name,
      },
      {
        Name: "email",
        Value: fields.email,
      },
      {
        Name: "email_verified",
        Value: "true",
      },
    ],
  };
  const results = await cisp.adminCreateUser(createUserParams).promise();

  // Add User to Group
  const addToGroupParams = {
    UserPoolId: userPoolId,
    Username: results.User.Username,
    GroupName: "employee",
  };
  console.log(results);
  await cisp.adminAddUserToGroup(addToGroupParams).promise();
  const employeeId = generateID();
  const item = {
    PK: employeeId,
    CognitoId: employeeId,
    name: fields.name,
    lastname: fields.lastname,
    email: fields.email,
    telephone: fields.telephone,
    status: "active",
    date: new Date().toISOString(),
    _metadata: request.event.requestContext,
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
  Matcher.HttpApiV2("GET", "/employees/"),
  enforceGroupMembership(["admin", "manager"]),
  getAllEmployees
);
router.add(
  Matcher.HttpApiV2("POST", "/employees/"),
  enforceGroupMembership(["admin", "manager"]),
  validateBodyJSONVariables(schemas.createEmployee),
  createEmployee
);
router.add(
  Matcher.HttpApiV2("GET", "/employees(/:id)"),
  enforceGroupMembership("admin", "manager"),
  validatePathVariables(schemas.idPathVariable),
  getEmployee
);

router.add(
  Matcher.HttpApiV2("GET", "/employees/contract(/:id)"),
  enforceGroupMembership("admin", "manager"),
  validatePathVariables(schemas.idPathVariable),
  getContract
);

// router.add(
//   Matcher.HttpApiV2('DELETE', '/employees(/:id)'),
//   enforceGroupMembership('admin'),
//   validatePathVariables(schemas.idPathVariable),
//   deleteUser,
// );

// Lambda Handler
exports.handler = async (event, context) => {
  return router.run(event, context);
};
