import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebApp } from './webapp';
import { AssetStorage } from './storage';
import { AppDatabase } from './database';
import { AppServices } from './services';
import { ApplicationAPI } from './api';
import { ApplicationAuth } from './auth';

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
      categoriesTable: this.database.categoriesTable,
      cardsTable: this.database.cardsTable,
      uploadBucket: this.storage.uploadBucket,
      assetBucket: this.storage.assetBucket,
      userPool: this.auth.userPool,
      // postAuthTrigger: this.auth.postAuthTrigger,
    });
    services.node.addDependency(this.storage);

    const api = new ApplicationAPI(this, 'API', {
      categoriesService: services.categoriesService,
      cardsService: services.cardsService,
      employeeService: services.employeeService,
      usersService: services.usersService,
      userPool: this.auth.userPool,
      userPoolClient: this.auth.userPoolClient,
      publicService: services.publicService,
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
  }
  
}
