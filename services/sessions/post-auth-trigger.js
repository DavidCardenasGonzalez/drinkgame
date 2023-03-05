import { AWSClients, generateID } from '../common';

// Utilize the DynamoDB Document Client
const dynamoDB = AWSClients.dynamoDB();
const tableName = process.env.DYNAMO_DB_TABLE;

exports.handler = async (event, context, callback) => {

  // Send post authentication data to Cloudwatch logs
  console.log ("Authentication successful");
  console.log ("Trigger function =", event.triggerSource);
  console.log ("User pool = ", event.userPoolId);
  console.log ("App client ID = ", event.callerContext.clientId);
  console.log ("User ID = ", event.userName);
  console.log (event);

  const userId = event.userName;
  const sessionId = generateID();
  const item = {
    PK: sessionId,
    EmployeeId: userId,
    Date: new Date().toISOString(),
    Info: event,
  };
  const params = {
    TableName: tableName,
    Item: item,
    ReturnValues: 'NONE',
  };
  await dynamoDB.put(params).promise();

  // Return to Amazon Cognito
  callback(null, event);
};