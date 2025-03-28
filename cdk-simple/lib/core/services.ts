import * as path from "path";
import { Construct } from "constructs";
import {
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_s3 as s3,
  aws_cognito as cognito,
  aws_ssm as ssm,
  aws_lambda_nodejs as ln,
  aws_lambda as lambda,
  Duration,
} from "aws-cdk-lib";
import { NodejsServiceFunction } from "../constructs/lambda";

interface AppServicesProps {
  employeeTable: dynamodb.ITable;
  categoriesTable: dynamodb.ITable;
  cardsTable: dynamodb.ITable;
  storiesTable: dynamodb.ITable; // Nueva tabla
  storyNodesTable: dynamodb.ITable; // Nueva tabla
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

  public readonly publicSandboxService: ln.NodejsFunction;

  public readonly storiesService: ln.NodejsFunction;

  public readonly storyNodesService: ln.NodejsFunction;

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

    this.cardsService = new NodejsServiceFunction(this, "CardsServiceLambda", {
      entry: path.join(__dirname, "../../../services/cards/index.js"),
    });

    props.categoriesTable.grantReadWriteData(this.cardsService);
    props.cardsTable.grantReadWriteData(this.cardsService);
    this.cardsService.addEnvironment("USER_POOL_ID", props.userPool.userPoolId);
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

    // Stories Service ------------------------------------------------------
    this.storiesService = new NodejsServiceFunction(
      this,
      "StoriesServiceLambda",
      {
        entry: path.join(__dirname, "../../../services/stories/index.js"),
        runtime: lambda.Runtime.NODEJS_16_X,
      }
    );

    props.storiesTable.grantReadWriteData(this.storiesService);
    this.storiesService.addEnvironment(
      "DYNAMO_DB_TABLE",
      props.storiesTable.tableName
    );
    this.storiesService.addEnvironment(
      "USER_POOL_ID",
      props.userPool.userPoolId
    );
    this.storiesService.addEnvironment(
      "ASSET_BUCKET",
      props.assetBucket.bucketName
    );
    props.assetBucket.grantReadWrite(this.storiesService);

    this.storiesService.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [props.userPool.userPoolArn],
        actions: ["cognito-idp:*"],
      })
    );

    // Story Nodes Service -------------------------------------------------
    this.storyNodesService = new NodejsServiceFunction(
      this,
      "StoryNodesServiceLambda",
      {
        entry: path.join(__dirname, "../../../services/storyNodes/index.js"), // Asegúrate de que este path sea correcto
        timeout: Duration.seconds(10),
        runtime: lambda.Runtime.NODEJS_16_X,
      }
    );

    props.storyNodesTable.grantReadWriteData(this.storyNodesService);
    this.storyNodesService.addEnvironment(
      "DYNAMO_DB_TABLE",
      props.storyNodesTable.tableName
    );
    this.storyNodesService.addEnvironment(
      "STORIES_DB_TABLE",
      props.storiesTable.tableName
    );
    this.storyNodesService.addEnvironment(
      "USER_POOL_ID",
      props.userPool.userPoolId
    );
    this.storyNodesService.addEnvironment(
      "ASSET_BUCKET",
      props.assetBucket.bucketName
    );
    props.assetBucket.grantReadWrite(this.storyNodesService);

    this.storyNodesService.addToRolePolicy(
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
        timeout: Duration.minutes(10),
      }
    );

    props.categoriesTable.grantReadWriteData(this.publicService);
    props.cardsTable.grantReadWriteData(this.publicService);
    props.storiesTable.grantReadWriteData(this.publicService);
    props.storyNodesTable.grantReadWriteData(this.publicService);
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
    this.publicService.addEnvironment(
      "STORIES_DB_TABLE",
      props.storiesTable.tableName
    );
    this.publicService.addEnvironment(
      "STORY_NODES_DB_TABLE",
      props.storyNodesTable.tableName
    );

    props.assetBucket.grantReadWrite(this.publicService);

    this.publicService.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [props.userPool.userPoolArn],
        actions: ["cognito-idp:*"],
      })
    );

    this.publicService.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["polly:SynthesizeSpeech"],
        resources: ["*"], 
      })
    );

      // Public Sandbox Service ------------------------------------------------------

      this.publicSandboxService = new NodejsServiceFunction(
        this,
        "PublicSandboxServiceLambda",
        {
          entry: path.join(__dirname, "../../../services/publicSandbox/index.js"),
          timeout: Duration.minutes(10),
          runtime: lambda.Runtime.NODEJS_16_X,
        }
      );
  
      props.categoriesTable.grantReadWriteData(this.publicSandboxService);
      props.cardsTable.grantReadWriteData(this.publicSandboxService);
      props.storiesTable.grantReadWriteData(this.publicSandboxService);
      props.storyNodesTable.grantReadWriteData(this.publicSandboxService);
      this.publicSandboxService.addEnvironment(
        "ASSET_BUCKET",
        props.assetBucket.bucketName
      );
      this.publicSandboxService.addEnvironment(
        "CATEGORIES_DB_TABLE",
        props.categoriesTable.tableName
      );
      this.publicSandboxService.addEnvironment(
        "CARDS_DB_TABLE",
        props.cardsTable.tableName
      );
      this.publicSandboxService.addEnvironment(
        "STORIES_DB_TABLE",
        props.storiesTable.tableName
      );
      this.publicSandboxService.addEnvironment(
        "STORY_NODES_DB_TABLE",
        props.storyNodesTable.tableName
      );
  
      props.assetBucket.grantReadWrite(this.publicSandboxService);
  
      this.publicSandboxService.addToRolePolicy(
        new iam.PolicyStatement({
          resources: [props.userPool.userPoolArn],
          actions: ["cognito-idp:*"],
        })
      );
  
      this.publicSandboxService.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ["polly:SynthesizeSpeech"],
          resources: ["*"], 
        })
      );
  }
}
