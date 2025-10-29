import * as cdk from 'aws-cdk-lib'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface CyberBuddyStackProps extends cdk.StackProps {
  environment: string
  config: {
    removalPolicy: cdk.RemovalPolicy
    enableBackup: boolean
    domainPrefix: string
  }
}

export class CyberBuddyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CyberBuddyStackProps) {
    super(scope, id, props)

    const { environment, config } = props

    // =====================
    // 1. DynamoDB Tables
    // =====================
    
    // Single table design
    const mainTable = new dynamodb.Table(this, 'MainTable', {
      tableName: `cyber-buddy-main-${environment}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: config.enableBackup,
      removalPolicy: config.removalPolicy,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    })

    // GSI for querying by date
    mainTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    })

    // =====================
    // 2. S3 Bucket for Pet Images
    // =====================
    
    const petImagesBucket = new s3.Bucket(this, 'PetImagesBucket', {
      bucketName: `cyber-buddy-pet-images-${environment}-${this.account}`,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ['chrome-extension://*'],
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: config.removalPolicy,
      autoDeleteObjects: config.removalPolicy === cdk.RemovalPolicy.DESTROY,
      lifecycleRules: [
        {
          id: 'DeleteTemporaryPets',
          prefix: 'tmp/',
          expiration: cdk.Duration.days(7),
          enabled: true,
        },
      ],
    })

    // =====================
    // 3. Lambda Layer for Shared Code
    // =====================

    const sharedLayer = new lambda.LayerVersion(this, 'SharedLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../shared')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Shared types and utilities',
    })

    // =====================
    // 4. Lambda Functions
    // =====================

    const lambdaEnvironment = {
      TABLE_NAME: mainTable.tableName,
      BUCKET_NAME: petImagesBucket.bucketName,
      GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || '',
      JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    }

    // Auth Lambda
    const authFunction = new lambda.Function(this, 'AuthFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/auth/dist')),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
      layers: [sharedLayer],
    })

    // Grant DynamoDB permissions
    mainTable.grantReadWriteData(authFunction)

    // Pets Lambda
    const petsFunction = new lambda.Function(this, 'PetsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/pets/dist')),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(60), // Image generation takes time
      memorySize: 1024,
      layers: [sharedLayer],
    })

    mainTable.grantReadWriteData(petsFunction)
    petImagesBucket.grantReadWrite(petsFunction)

    // Activities Lambda
    const activitiesFunction = new lambda.Function(this, 'ActivitiesFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/activities/dist')),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
      layers: [sharedLayer],
    })

    mainTable.grantReadWriteData(activitiesFunction)

    // =====================
    // 5. API Gateway
    // =====================
    
    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: 'Cyber Buddy API',
      description: 'API for Cyber Buddy Chrome Extension',
      deployOptions: {
        stageName: 'v1',
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Requested-With',
        ],
        allowCredentials: true,
      },
    })

    // Auth endpoints (no auth required)
    const auth = api.root.addResource('auth')
    auth.addResource('google').addMethod('POST', new apigateway.LambdaIntegration(authFunction))
    auth.addResource('refresh').addMethod('POST', new apigateway.LambdaIntegration(authFunction))
    auth.addResource('logout').addMethod('POST', new apigateway.LambdaIntegration(authFunction))

    // Protected endpoints (TODO: Add Lambda authorizer later)
    const pets = api.root.addResource('pets')
    pets.addMethod('GET', new apigateway.LambdaIntegration(petsFunction))
    pets.addMethod('POST', new apigateway.LambdaIntegration(petsFunction))

    // Random prompt endpoint
    const randomPrompt = pets.addResource('random-prompt')
    randomPrompt.addMethod('GET', new apigateway.LambdaIntegration(petsFunction))

    const petById = pets.addResource('{petId}')
    petById.addMethod('GET', new apigateway.LambdaIntegration(petsFunction))
    petById.addMethod('DELETE', new apigateway.LambdaIntegration(petsFunction))

    // Confirm endpoint (convert temporary pet to permanent)
    const petConfirm = petById.addResource('confirm')
    petConfirm.addMethod('POST', new apigateway.LambdaIntegration(petsFunction))

    const activities = api.root.addResource('activities')
    activities.addMethod('POST', new apigateway.LambdaIntegration(activitiesFunction))
    activities.addResource('stats').addMethod('GET', new apigateway.LambdaIntegration(activitiesFunction))

    // Simple chat endpoint (ephemeral, no auth for now)
    const chat = api.root.addResource('chat')
    chat.addMethod('POST', new apigateway.LambdaIntegration(petsFunction))

    // =====================
    // 6. Outputs
    // =====================

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
      exportName: `CyberBuddy-ApiUrl-${environment}`,
    })

    new cdk.CfnOutput(this, 'PetImagesBucketName', {
      value: petImagesBucket.bucketName,
      description: 'S3 Bucket for Pet Images',
      exportName: `CyberBuddy-PetImagesBucket-${environment}`,
    })

    new cdk.CfnOutput(this, 'TableName', {
      value: mainTable.tableName,
      description: 'DynamoDB Table Name',
      exportName: `CyberBuddy-TableName-${environment}`,
    })
  }
}
