import * as path from "path";
import { aws_cognito as cognito } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsServiceFunction } from "../constructs/lambda";

export class ApplicationAuth extends Construct {
  public readonly userPool: cognito.IUserPool;

  public readonly userPoolClient: cognito.IUserPoolClient;

  public readonly postAuthTrigger: NodejsServiceFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.postAuthTrigger = new NodejsServiceFunction(
      this,
      "PostAuthTrigger",
      {
        entry: path.join(__dirname, "../../../services/sessions/post-auth-trigger.js"),
      }
    );

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: false,
      autoVerify: {
        email: false,
      },
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        fullname: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
        profilePicture: {
          required: false,
          mutable: true,
        },
      },
      lambdaTriggers: {
        postAuthentication: this.postAuthTrigger,
      },
    });

    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userSrp: true,
      },
    });

    // Groups -----------------------------------------------------------------------

    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'admin',
      precedence: 1,
      description: 'Admin users',
    });

    new cognito.CfnUserPoolGroup(this, 'ManagerrGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'manager',
      precedence: 5,
      description: 'Users who can manage documents but not users',
    });

    new cognito.CfnUserPoolGroup(this, 'EmployeeGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'employee',
      precedence: 10,
      description: 'Users who can only read and comment',
    });
  }
}
