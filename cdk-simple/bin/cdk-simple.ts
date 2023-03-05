#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BodazenInfrastructureMain } from '../lib/core/main';

const app = new cdk.App();
const mainStack = new BodazenInfrastructureMain(app, 'Bodazen');
// new BodazenServicesStack(app,'BodazenServices', {
//     storage: mainStack.storage,
//     auth:  mainStack.auth,
//     database:  mainStack.database,
// });
// app.synth()
