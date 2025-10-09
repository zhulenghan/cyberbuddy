#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CyberBuddyStack } from '../lib/cyberbuddy-stack.js'

const app = new cdk.App()

// Get environment from context or env variable
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev'

// Validate environment
const validEnvironments = ['dev', 'staging', 'prod']
if (!validEnvironments.includes(environment)) {
  throw new Error(`Invalid environment: ${environment}. Must be one of: ${validEnvironments.join(', ')}`)
}

// Stack name with environment suffix
const stackName = `CyberBuddy-${environment}`

// Environment-specific configuration
const envConfig = {
  dev: {
    removalPolicy: cdk.RemovalPolicy.DESTROY, // Allow deletion for dev
    enableBackup: false,
    domainPrefix: 'dev',
  },
  staging: {
    removalPolicy: cdk.RemovalPolicy.RETAIN,
    enableBackup: true,
    domainPrefix: 'staging',
  },
  prod: {
    removalPolicy: cdk.RemovalPolicy.RETAIN, // Never delete prod data
    enableBackup: true,
    domainPrefix: 'app',
  },
}

new CyberBuddyStack(app, stackName, {
  // CDK will automatically use credentials from AWS_PROFILE
  // No need to specify account explicitly
  env: {
    region: process.env.AWS_REGION || 'us-east-1',
  },
  tags: {
    Project: 'CyberBuddy',
    Environment: environment,
    ManagedBy: 'CDK',
  },
  environment,
  config: envConfig[environment as keyof typeof envConfig],
})

app.synth()
