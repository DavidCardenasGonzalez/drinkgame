import * as path from "path";
import { Construct } from "constructs";
import {
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_s3 as s3,
  aws_cognito as cognito,
  aws_ssm as ssm,
  aws_lambda_nodejs as ln,
  Duration,
} from "aws-cdk-lib";
import { NodejsServiceFunction } from "../constructs/lambda";

interface AppServicesProps {
  documentsTable: dynamodb.ITable;
  sessionsTable: dynamodb.ITable;
  employeeTable: dynamodb.ITable;
  uploadBucket: s3.IBucket;
  assetBucket: s3.IBucket;
  userPool: cognito.IUserPool;
  postAuthTrigger: NodejsServiceFunction;
}

export class AppServices extends Construct {
  public readonly commentsService: ln.NodejsFunction;

  public readonly documentsService: ln.NodejsFunction;

  public readonly notificationsService: ln.NodejsFunction;

  public readonly usersService: ln.NodejsFunction;

  public readonly employeeService: ln.NodejsFunction;

  constructor(scope: Construct, id: string, props: AppServicesProps) {
    super(scope, id);

    // Comments Service -------------------------------------------------

    this.commentsService = new NodejsServiceFunction(
      this,
      "CommentServiceLambda",
      {
        entry: path.join(__dirname, "../../../services/comments/index.js"),
      }
    );

    props.documentsTable.grantReadWriteData(this.commentsService);

    this.commentsService.addToRolePolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["events:PutEvents"],
      })
    );

    this.commentsService.addEnvironment(
      "DYNAMO_DB_TABLE",
      props.documentsTable.tableName
    );

    // Documents Service ------------------------------------------------

    this.documentsService = new NodejsServiceFunction(
      this,
      "DocumentServiceLambda",
      {
        entry: path.join(__dirname, "../../../services/documents/index.js"),
        timeout: Duration.seconds(10),
      }
    );

    props.documentsTable.grantReadWriteData(this.documentsService);
    props.uploadBucket.grantWrite(this.documentsService);
    props.assetBucket.grantRead(this.documentsService);
    this.documentsService.addEnvironment(
      "DYNAMO_DB_TABLE",
      props.documentsTable.tableName
    );
    this.documentsService.addEnvironment(
      "UPLOAD_BUCKET",
      props.uploadBucket.bucketName
    );
    this.documentsService.addEnvironment(
      "ASSET_BUCKET",
      props.assetBucket.bucketName
    );

    // Notifications Service ---------------------------------------------

    this.notificationsService = new NodejsServiceFunction(
      this,
      "NotificationsServiceLambda",
      {
        entry: path.join(__dirname, "../../../services/notifications/index.js"),
      }
    );

    this.notificationsService.addToRolePolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
      })
    );

    props.documentsTable.grantReadData(this.notificationsService);

    this.notificationsService.addEnvironment(
      "DYNAMO_DB_TABLE",
      props.documentsTable.tableName
    );
    this.notificationsService.addEnvironment(
      "EMAIL_ADDRESS",
      ssm.StringParameter.valueForStringParameter(
        this,
        "dms-globomantics-email"
      )
    );

    // Session Service ---------------------------------------------------

    props.sessionsTable.grantReadWriteData(props.postAuthTrigger);

    props.postAuthTrigger.addToRolePolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["events:PutEvents"],
      })
    );

    props.postAuthTrigger.addEnvironment(
      "DYNAMO_DB_TABLE",
      props.sessionsTable.tableName
    );
    // Users Service ------------------------------------------------------

    this.usersService = new NodejsServiceFunction(this, "UsersServiceLambda", {
      entry: path.join(__dirname, "../../../services/users/index.js"),
    });

    this.usersService.addEnvironment("USER_POOL_ID", props.userPool.userPoolId);
    this.usersService.addEnvironment(
      "ASSET_BUCKET",
      props.assetBucket.bucketName
    );
    props.assetBucket.grantReadWrite(this.usersService);

    this.usersService.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [props.userPool.userPoolArn],
        actions: ["cognito-idp:*"],
      })
    );

     // Employee Service ------------------------------------------------------

     this.employeeService = new NodejsServiceFunction(this, "EmployeeServiceLambda", {
      entry: path.join(__dirname, "../../../services/employees/index.js"),
    });

    props.employeeTable.grantReadWriteData(this.employeeService);
    this.employeeService.addEnvironment("USER_POOL_ID", props.userPool.userPoolId);
    this.employeeService.addEnvironment(
      "ASSET_BUCKET",
      props.assetBucket.bucketName
    );
    this.employeeService.addEnvironment(
      "DYNAMO_DB_TABLE",
      props.employeeTable.tableName
    );
    props.assetBucket.grantReadWrite(this.employeeService);

    this.employeeService.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [props.userPool.userPoolArn],
        actions: ["cognito-idp:*"],
      })
    );
  }
}
