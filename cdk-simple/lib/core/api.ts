import { Construct } from "constructs";
import {
  aws_lambda as lambda,
  aws_cognito as cognito,
  aws_iam as iam,
  aws_sqs as sqs,
  aws_apigatewayv2 as apigv2_cfn,
  CfnOutput,
  Duration,
} from "aws-cdk-lib";
import * as apigv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpUserPoolAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

interface ApplicationAPIProps {
  employeeService: lambda.IFunction;
  categoriesService: lambda.IFunction;
  cardsService: lambda.IFunction;
  usersService: lambda.IFunction;
  publicService: lambda.IFunction;
  publicSandboxService: lambda.IFunction;
  storiesService: lambda.IFunction;
  storyNodesService: lambda.IFunction;
  userPool: cognito.IUserPool;
  userPoolClient: cognito.IUserPoolClient;
}

export class ApplicationAPI extends Construct {
  public readonly httpApi: apigv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApplicationAPIProps) {
    super(scope, id);

    const serviceMethods = [
      apigv2.HttpMethod.GET,
      apigv2.HttpMethod.POST,
      apigv2.HttpMethod.DELETE,
      apigv2.HttpMethod.PUT,
      apigv2.HttpMethod.PATCH,
    ];

    // API Gateway ------------------------------------------------------

    this.httpApi = new apigv2.HttpApi(this, "HttpProxyApi", {
      apiName: "serverless-api",
      createDefaultStage: true,
      corsPreflight: {
        allowHeaders: ["Authorization", "Content-Type", "*"],
        allowMethods: [
          apigv2.CorsHttpMethod.GET,
          apigv2.CorsHttpMethod.POST,
          apigv2.CorsHttpMethod.DELETE,
          apigv2.CorsHttpMethod.PUT,
          apigv2.CorsHttpMethod.PATCH,
        ],
        allowOrigins: [
          "http://localhost:3000",
          "https://*",
          "http://localhost:19006",
          "http://localhost:8081",
        ],
        allowCredentials: true,
        maxAge: Duration.days(10),
      },
    });

    // Authorizer -------------------------------------------------------

    const authorizer = new HttpUserPoolAuthorizer(
      "Authorizer",
      props.userPool,
      {
        userPoolClients: [props.userPoolClient],
      }
    );

    // Users Service ------------------------------------------------------

    const usersServiceIntegration = new HttpLambdaIntegration(
      "UsersIntegration",
      props.usersService
    );

    this.httpApi.addRoutes({
      path: `/users/{proxy+}`,
      methods: serviceMethods,
      integration: usersServiceIntegration,
      authorizer,
    });

    // Employee Service ------------------------------------------------------

    const employeeServiceIntegration = new HttpLambdaIntegration(
      "EmployeesIntegration",
      props.employeeService
    );

    this.httpApi.addRoutes({
      path: `/employees/{proxy+}`,
      methods: serviceMethods,
      integration: employeeServiceIntegration,
      authorizer,
    });

    // Category Service ------------------------------------------------------

    const categoryServiceIntegration = new HttpLambdaIntegration(
      "CategoriesIntegration",
      props.categoriesService
    );

    this.httpApi.addRoutes({
      path: `/categories/{proxy+}`,
      methods: serviceMethods,
      integration: categoryServiceIntegration,
      authorizer,
    });

    // Cards Service ------------------------------------------------------

    const cardServiceIntegration = new HttpLambdaIntegration(
      "CardsIntegration",
      props.cardsService
    );

    this.httpApi.addRoutes({
      path: `/cards/{proxy+}`,
      methods: serviceMethods,
      integration: cardServiceIntegration,
      authorizer,
    });

    // Public Service ------------------------------------------------------

    const publicServiceIntegration = new HttpLambdaIntegration(
      "PublicIntegration",
      props.publicService
    );

    this.httpApi.addRoutes({
      path: `/public/{proxy+}`,
      methods: serviceMethods,
      integration: publicServiceIntegration,
      authorizer: new apigv2.HttpNoneAuthorizer(),
    });

    // Public Sandbox Service ------------------------------------------------------

    const publicSandboxServiceIntegration = new HttpLambdaIntegration(
      "PublicSandboxIntegration",
      props.publicSandboxService
    );

    this.httpApi.addRoutes({
      path: `/publicSandbox/{proxy+}`,
      methods: serviceMethods,
      integration: publicSandboxServiceIntegration,
      authorizer: new apigv2.HttpNoneAuthorizer(),
    });

    // Stories Service ------------------------------------------------------
    const storiesServiceIntegration = new HttpLambdaIntegration(
      "StoriesIntegration",
      props.storiesService
    );

    this.httpApi.addRoutes({
      path: `/stories/{proxy+}`,
      methods: serviceMethods,
      integration: storiesServiceIntegration,
      authorizer,
    });

    // Story Nodes Service ------------------------------------------------------
    const storyNodesServiceIntegration = new HttpLambdaIntegration(
      "StoryNodesIntegration",
      props.storyNodesService
    );

    this.httpApi.addRoutes({
      path: `/storyNodes/{proxy+}`,
      methods: serviceMethods,
      integration: storyNodesServiceIntegration,
      authorizer,
    });

    // Moderate ----------------------------------------------------------

    const queue = new sqs.Queue(this, "ModerationQueue");

    const moderateRole = new iam.Role(this, "ModerateRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });

    moderateRole.addToPolicy(
      new iam.PolicyStatement({
        resources: [queue.queueArn],
        actions: ["sqs:SendMessage"],
      })
    );

    const sqsIntegration = new apigv2_cfn.CfnIntegration(
      this,
      "ModerateIntegration",
      {
        apiId: this.httpApi.apiId,
        integrationType: "AWS_PROXY",
        integrationSubtype: "SQS-SendMessage",
        credentialsArn: moderateRole.roleArn,
        requestParameters: {
          QueueUrl: queue.queueUrl,
          MessageBody: "$request.body",
        },
        payloadFormatVersion: "1.0",
        timeoutInMillis: 10000,
      }
    );

    new apigv2_cfn.CfnRoute(this, "ModerateRoute", {
      apiId: this.httpApi.apiId,
      routeKey: "POST /moderate",
      target: `integrations/${sqsIntegration.ref}`,
    });

    // Outputs -----------------------------------------------------------

    new CfnOutput(this, "URL", {
      value: this.httpApi.apiEndpoint,
    });
  }
}
