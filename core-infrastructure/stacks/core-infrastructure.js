#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const fs = require('fs');
const path = require('path');
const { CoreInfrastructureStack } = require('./core-infrastructure-stack');

// Read centralized config from project root's project.json
const configPath = path.join(__dirname, '..', '..', 'project.json');
const projectConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = new cdk.App();
const stack = new CoreInfrastructureStack(app, `${projectConfig.projectName}-CoreInfrastructureStack`, {
  env: { region: projectConfig.regions.default },
  projectConfig,  // Pass the full project config; stack will extract needed sections
});

// Add AppManagerCFNStackKey tag for AWS Systems Manager Application Manager and cost tracking (groups all stacks under projectName)
cdk.Tags.of(stack).add('AppManagerCFNStackKey', projectConfig.projectName);