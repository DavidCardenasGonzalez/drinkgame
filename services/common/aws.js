import * as AWS from 'aws-sdk';
import AWSXRay from 'aws-xray-sdk';

let _dynamoDB;

/**
 * Creates the DynamoDB client for use in the application.
 *
 * @returns {object} DynamoDB Client
 */
const dynamoDB = () => {
  if (!_dynamoDB) {
    _dynamoDB = new AWS.DynamoDB.DocumentClient();
    AWSXRay.captureAWSClient(_dynamoDB.service);
  }
  return _dynamoDB;
};

let _s3;

/**
 * Creates the Amazon S3 client for use in the application.
 *
 * @returns {object} Amazon S3 Client
 */
const s3 = () => {
  if (!_s3) {
    _s3 = AWSXRay.captureAWSClient(new AWS.S3());
  }
  return _s3;
};

let _textract;

/**
 * Creates the Textract client for use in the application.
 *
 * @returns {object} Textract Client
 */
const textract = () => {
  if (!_textract) {
    _textract = AWSXRay.captureAWSClient(new AWS.Textract());
  }
  return _textract;
};

let _ses;

/**
 * Creates the Simple Email Service (SES) client for use in the application.
 *
 * @returns {object} Simple Email Service Client
 */
const ses = () => {
  if (!_ses) {
    _ses = AWSXRay.captureAWSClient(new AWS.SES());
  }
  return _ses;
};

let _eventbridge;

/**
 * Creates the Eventbridge client for use in the application.
 *
 * @returns {object} Eventbridge Client
 */
const eventbridge = () => {
  if (!_eventbridge) {
    _eventbridge = AWSXRay.captureAWSClient(new AWS.EventBridge());
  }
  return _eventbridge;
};

let _cisp;

/**
 * Creates the Cognito Identity Service Provider client for use in the application.
 *
 * @returns {object} Cognito Identity Service Provider Client
 */
const cisp = () => {
  if (!_cisp) {
    _cisp = AWSXRay.captureAWSClient(new AWS.CognitoIdentityServiceProvider());
  }
  return _cisp;
};

let _polly;

const polly = () => {
  if (!_polly) {
    // Crea la instancia del cliente Polly
    _polly = AWSXRay.captureAWSClient(new AWS.Polly());
  }
  return _polly;
};

export const AWSClients = {
  dynamoDB,
  s3,
  textract,
  ses,
  eventbridge,
  cisp,
  polly,
};
