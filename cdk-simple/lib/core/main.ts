import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebApp } from './webapp';
import { AssetStorage } from './storage';
import { AppDatabase } from './database';
import { AppServices } from './services';
import { ApplicationAPI } from './api';
import { ApplicationEvents } from './events';
import { ApplicationAuth } from './auth';
import { ApplicationMonitoring } from './monitoring';
import { DocumentProcessing } from './processing';

export class BodazenInfrastructureMain extends Stack {
  public storage: AssetStorage;
  public auth: ApplicationAuth;
  public database: AppDatabase;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.storage = new AssetStorage(this, 'Storage');

    this.auth = new ApplicationAuth(this, 'Auth');

    this.database = new AppDatabase(this, 'Database');

    const services = new AppServices(this, 'Services', {
      employeeTable: this.database.employeeTable,
      documentsTable: this.database.documentsTable,
      sessionsTable: this.database.sessionsTable,
      uploadBucket: this.storage.uploadBucket,
      assetBucket: this.storage.assetBucket,
      userPool: this.auth.userPool,
      postAuthTrigger: this.auth.postAuthTrigger,
    });
    services.node.addDependency(this.storage);

    const api = new ApplicationAPI(this, 'API', {
      employeeService: services.employeeService,
      commentsService: services.commentsService,
      documentsService: services.documentsService,
      usersService: services.usersService,
      userPool: this.auth.userPool,
      userPoolClient: this.auth.userPoolClient,
    });

    const processing = new DocumentProcessing(this, 'Processing', {
      uploadBucket: this.storage.uploadBucket,
      assetBucket: this.storage.assetBucket,
      documentsTable: this.database.documentsTable,
    });

    new ApplicationEvents(this, 'Events', {
      uploadBucket: this.storage.uploadBucket,
      processingStateMachine: processing.processingStateMachine,
      notificationsService: services.notificationsService,
    });

    const webapp = new WebApp(this, 'WebApp', {
      hostingBucket: this.storage.hostingBucket,
      baseDirectory: '../',
      relativeWebAppPath: 'webapp',
      httpApi: api.httpApi,
      userPool: this.auth.userPool,
      userPoolClient: this.auth.userPoolClient,
    });
    webapp.node.addDependency(this.auth);

    new ApplicationMonitoring(this, 'Monitoring', {
      api: api.httpApi,
      table: this.database.documentsTable,
      processingStateMachine: processing.processingStateMachine,
      assetsBucket: this.storage.assetBucket,
      documentsService: services.documentsService,
      commentsService: services.commentsService,
      usersService: services.usersService,
    });
  
  }
  
}
