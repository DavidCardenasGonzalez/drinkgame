import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { Construct } from 'constructs';

export class AppDatabase extends Construct {
  public readonly employeeTable: dynamodb.ITable;
  public readonly categoriesTable: dynamodb.ITable;
  
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Employees table ------------------

    const employeeTable = new dynamodb.Table(this, 'EmployeeTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'CognitoId',
        type: dynamodb.AttributeType.STRING,
      },
    });

    employeeTable.addGlobalSecondaryIndex({
      // indexName: 'status',
      indexName: 'GSI1',
      partitionKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
      // nonKeyAttributes: ['name', 'lastname'],
    });
    
    this.employeeTable = employeeTable;

      // Categories table ------------------

      const categoriesTable = new dynamodb.Table(this, 'CategoryTable', {
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: 'PK',
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: {
          name: 'status',
          type: dynamodb.AttributeType.STRING,
        },
      });
  
      categoriesTable.addGlobalSecondaryIndex({
        // indexName: 'status',
        indexName: 'GSI1',
        partitionKey: {
          name: 'status',
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: {
          name: 'PK',
          type: dynamodb.AttributeType.STRING,
        },
        projectionType: dynamodb.ProjectionType.ALL,
        // nonKeyAttributes: ['name', 'lastname'],
      });
      
      this.categoriesTable = categoriesTable;
  }
}
