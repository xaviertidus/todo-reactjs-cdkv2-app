const fs = require('fs');
const path = require('path');

// Resolve paths relative to the project root
const projectRoot = path.resolve(__dirname, '..', '..');  // Up to cdk-reactjs-app/
const configPath = path.join(__dirname, '..', 'src', 'config.json');  // reactjs-app/src/config.json (will be generated)
const projectJsonPath = path.join(projectRoot, 'project.json');
const coreOutputsPath = path.join(projectRoot, 'outputs', 'core.json');
const apiOutputsPath = path.join(projectRoot, 'outputs', 'api.json');
const appHostingOutputsPath = path.join(projectRoot, 'outputs', 'apphosting.json');

// Helper to read JSON file safely
function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}. Ensure stacks are deployed or project.json exists.`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Load centralized project.json
const projectJson = readJson(projectJsonPath);

// Initialize config structure (since local config.json is removed, generate from scratch)
let config = {
  environmentConfig: {
    coreInfrastructure: {
      cognitoConfiguration: {}
    },
    hostingInfrastructure: {
      websiteDomain: projectJson.domains.website,
      apiDomain: projectJson.domains.api
    }
  },
  appConfig: {}
};

// Load and apply Core outputs for Cognito
const coreOutputs = readJson(coreOutputsPath)[`${projectJson.projectName}-CoreInfrastructureStack`] || {};
config.environmentConfig.coreInfrastructure.cognitoConfiguration = {
  identityPoolId: coreOutputs.IdentityPoolId,
  userpoolId: coreOutputs.UserPoolId,
  userpoolClientId: coreOutputs.UserPoolClientId,
};

// Load and apply API outputs for apiDomain
const apiOutputs = readJson(apiOutputsPath)[`${projectJson.projectName}-ApiStack`] || {};
const apiUrl = apiOutputs.ApiUrl;
if (apiUrl) {
  const apiDomain = apiUrl.replace(/^https?:\/\//, '');
  config.environmentConfig.hostingInfrastructure.apiDomain = apiDomain;
} else {
  console.warn('ApiUrl not found; apiDomain falls back to project.json value.');
}

// Load and apply App Hosting outputs for websiteDomain (optional)
let appHostingOutputs = {};
try {
  appHostingOutputs = readJson(appHostingOutputsPath)[`${projectJson.projectName}-AppHostingStack`] || {};
} catch (err) {
  console.warn(`Skipping websiteDomain update: ${err.message}`);
}
const cloudFrontDomain = appHostingOutputs.CloudFrontDomain;
if (cloudFrontDomain) {
  config.environmentConfig.hostingInfrastructure.websiteDomain = cloudFrontDomain.replace(/^https?:\/\//, '');  // Strip protocol for consistency
} else {
  console.warn('CloudFrontDomain not found or skipped; websiteDomain falls back to project.json value.');
}

// Write generated config back
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
console.log('Generated src/config.json from project.json and stack outputs.');