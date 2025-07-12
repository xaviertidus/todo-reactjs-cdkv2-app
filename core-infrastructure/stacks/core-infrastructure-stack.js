const cdk = require('aws-cdk-lib');
const cognito = require('aws-cdk-lib/aws-cognito');

class CoreInfrastructureStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { projectConfig } = props;

    // Removed persistent S3 bucket section, as it's no longer needed in this stack

    // Section: Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'ToDoUserPool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        givenName: { required: true, mutable: true },
        familyName: { required: true, mutable: true },
        email: { required: true, mutable: false },
      },
      customAttributes: {}, // Add if needed
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      // Added removal policy to DESTROY for deletion on stack destroy
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Section: User Pool Client
    const userPoolClient = userPool.addClient('UserPoolClient', {
      userPoolClientName: 'ToDoAppClient',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
    });

    // Section: Identity Pool
    const identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: userPoolClient.userPoolClientId,
        providerName: userPool.userPoolProviderName,
      }],
    });
    // Added removal policy to DESTROY for deletion on stack destroy (applied to Cfn resource)
    identityPool.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // Outputs for console copy-paste (removed S3BucketName output)
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'IdentityPoolId', { value: identityPool.ref });
  }
}

module.exports = { CoreInfrastructureStack };