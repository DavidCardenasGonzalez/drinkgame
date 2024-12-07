import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { Construct } from 'constructs';

export class AppDatabase extends Construct {
  public readonly employeeTable: dynamodb.ITable;
  public readonly categoriesTable: dynamodb.ITable;
  public readonly cardsTable: dynamodb.ITable;
  public readonly storiesTable: dynamodb.ITable;
  public readonly storyNodesTable: dynamodb.ITable;
  
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
    });
    
    this.employeeTable = employeeTable;

    // Categories table ------------------
    const categoriesTable = new dynamodb.Table(this, 'CategoryTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
    });
    
    this.categoriesTable = categoriesTable;

    // Cards table ------------------
    const cardsTable = new dynamodb.Table(this, 'CardTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'categoryId',
        type: dynamodb.AttributeType.STRING,
      },
    });

    cardsTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: {
        name: 'categoryId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });
    
    this.cardsTable = cardsTable;

    // Stories table ------------------
    const storiesTable = new dynamodb.Table(this, 'StoriesTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
    });
    
    this.storiesTable = storiesTable;

    // Story Nodes table ------------------
    const storyNodesTable = new dynamodb.Table(this, 'StoryNodesTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'storyId',
        type: dynamodb.AttributeType.STRING,
      },
    });

    // Índice secundario si necesitas consultar nodos por contenido o algún otro atributo
    storyNodesTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: {
        name: 'storyId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });
    
    this.storyNodesTable = storyNodesTable;
  }
}
