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
  employeeTable: dynamodb.ITable;
  categoriesTable: dynamodb.ITable;
  cardsTable: dynamodb.ITable;
  uploadBucket: s3.IBucket;
  assetBucket: s3.IBucket;
  userPool: cognito.IUserPool;
  // postAuthTrigger: NodejsServiceFunction;
}

export class AppServices extends Construct {

  public readonly notificationsService: ln.NodejsFunction;

  public readonly usersService: ln.NodejsFunction;

  public readonly employeeService: ln.NodejsFunction;

  public readonly categoriesService: ln.NodejsFunction;

  public readonly cardsService: ln.NodejsFunction;

  public readonly publicService: ln.NodejsFunction;

  constructor(scope: Construct, id: string, props: AppServicesProps) {
    super(scope, id);
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

    this.employeeService = new NodejsServiceFunction(
      this,
      "EmployeeServiceLambda",
      {
        entry: path.join(__dirname, "../../../services/employees/index.js"),
      }
    );

    props.employeeTable.grantReadWriteData(this.employeeService);
    this.employeeService.addEnvironment(
      "USER_POOL_ID",
      props.userPool.userPoolId
    );
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

    // Categories Service ------------------------------------------------------

    this.categoriesService = new NodejsServiceFunction(
      this,
      "CategoriesServiceLambda",
      {
        entry: path.join(__dirname, "../../../services/categories/index.js"),
      }
    );

    props.categoriesTable.grantReadWriteData(this.categoriesService);
    props.cardsTable.grantReadWriteData(this.categoriesService);
    this.categoriesService.addEnvironment(
      "USER_POOL_ID",
      props.userPool.userPoolId
    );
    this.categoriesService.addEnvironment(
      "ASSET_BUCKET",
      props.assetBucket.bucketName
    );
    this.categoriesService.addEnvironment(
      "DYNAMO_DB_TABLE",
      props.categoriesTable.tableName
    );
    this.categoriesService.addEnvironment(
      "CARDS_DB_TABLE",
      props.cardsTable.tableName
    );
    props.assetBucket.grantReadWrite(this.categoriesService);

    this.categoriesService.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [props.userPool.userPoolArn],
        actions: ["cognito-idp:*"],
      })
    );

    // Cards Service ------------------------------------------------------

    this.cardsService = new NodejsServiceFunction(
      this,
      "CardsServiceLambda",
      {
        entry: path.join(__dirname, "../../../services/cards/index.js"),
      }
    );

    props.categoriesTable.grantReadWriteData(this.cardsService);
    props.cardsTable.grantReadWriteData(this.cardsService);
    this.cardsService.addEnvironment(
      "USER_POOL_ID",
      props.userPool.userPoolId
    );
    this.cardsService.addEnvironment(
      "ASSET_BUCKET",
      props.assetBucket.bucketName
    );
    this.cardsService.addEnvironment(
      "CATEGORIES_DB_TABLE",
      props.categoriesTable.tableName
    );
    this.cardsService.addEnvironment(
      "DYNAMO_DB_TABLE",
      props.cardsTable.tableName
    );
    props.assetBucket.grantReadWrite(this.cardsService);

    this.cardsService.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [props.userPool.userPoolArn],
        actions: ["cognito-idp:*"],
      })
    );


    // Public Service ------------------------------------------------------

    this.publicService = new NodejsServiceFunction(
      this,
      "PublicServiceLambda",
      {
        entry: path.join(__dirname, "../../../services/public/index.js"),
      }
    );

    props.categoriesTable.grantReadWriteData(this.publicService);
    this.publicService.addEnvironment(
      "ASSET_BUCKET",
      props.assetBucket.bucketName
    );
    this.publicService.addEnvironment(
      "CATEGORIES_DB_TABLE",
      props.categoriesTable.tableName
    );
    this.publicService.addEnvironment(
      "CARDS_DB_TABLE",
      props.cardsTable.tableName
    );

    props.assetBucket.grantReadWrite(this.publicService);

    this.publicService.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [props.userPool.userPoolArn],
        actions: ["cognito-idp:*"],
      })
    );
  }
}
