import { aws_lambda as lambda, aws_logs as logs, Duration } from 'aws-cdk-lib';
import { NodejsFunctionProps, NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

type NodejsServiceFunctionProps = NodejsFunctionProps & { timeout?: Duration };

export class NodejsServiceFunction extends NodejsFunction {
  constructor(scope: Construct, id: string, props: NodejsServiceFunctionProps) {
    const runtime = props.runtime ?? lambda.Runtime.NODEJS_14_X;
    const handler = 'handler';
    const bundling = {
      externalModules: ['aws-sdk'],
    };
    const logRetention = logs.RetentionDays.ONE_DAY;
    const tracing = lambda.Tracing.ACTIVE;
    const timeout = props.timeout ?? Duration.seconds(30); // Cambia este valor según sea necesario

    super(scope, id, {
      ...props,
      tracing,
      runtime,
      handler,
      bundling,
      logRetention,
      timeout
    });

    this.addEnvironment('LOG_LEVEL', '40');
  }
}
