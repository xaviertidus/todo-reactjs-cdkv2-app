# CDK React.js To-Do App Boilerplate

This is a boilerplate for a typical web application setup using AWS CDK V2 for infrastructure and a React.js frontend. It demonstrates a personal to-do application with user authentication via Cognito, API endpoints for to-do management, and hosting on S3/CloudFront.

## Prerequisites
- AWS account with CDK bootstrapped (`cdk bootstrap`).
- Node.js and npm installed.
- Python for Lambdas (in API).
- AWS CLI configured with credentials.

## Configuration
All project configuration is centralized in `project.json` at the root. Edit this file for regions, domains, ARNs, etc., before deploying. Set a unique `projectName` (e.g., "myproject") to prefix stack names and avoid collisions in multi-instance deployments (code appends "-" where needed for readability).

## Setup and Deployment

1. **Clone or create the project structure** as outlined in the directory tree.

2. **Core Infrastructure**:
   - Navigate to `core-infrastructure/`.
   - Run `npm install`.
   - Create the outputs folder in the project root if it doesn't exist: `mkdir ../outputs`.
   - Deploy: `npm run deploy`.
   - Outputs are written to `../outputs/core.json`.

3. **API**:
   - Navigate to `api/`.
   - Run `npm install`.
   - Deploy: `npm run deploy` (reads from `project.json` and `../outputs/core.json`).
   - Outputs are written to `../outputs/api.json`.

4. **App Hosting (Infrastructure Only)**:
   - Navigate to `apphosting/`.
   - Run `npm install`.
   - Deploy: `npm run deploy` (reads from `project.json`).
   - Outputs are written to `../outputs/apphosting.json`.

5. **React.js App**:
   - Navigate to `reactjs-app/`.
   - Run `npm install`.
   - Run `npm run build`: Generates `src/config.json` from `project.json` and outputs; builds to `build/`.
   - Dev: `npm start` (automatically generates `src/config.json` if missing before starting the dev server; ensure stacks are deployed first to avoid errors).

6. **Website Code Deployment**:
   - Navigate to `reactjs-app/cdk-deploy/`.
   - Run `npm install` (first time).
   - Deploy: `npm run deploy` (this automatically runs `npm run build` in the parent reactjs-app to generate config.json and build the app, then uploads `build/` to infra and invalidates CloudFront).

## Cost Tracking with AWS Systems Manager Application Manager
All stacks are tagged with "AppManagerCFNStackKey" using the `projectName` value from `project.json` to group them as a single application for cost tracking in AWS Systems Manager Application Manager.

After deployment:
1. Go to the AWS Billing and Cost Management console.
2. Navigate to "Cost allocation tags" in the left menu.
3. Under "User-defined cost allocation tags", find "AppManagerCFNStackKey" and activate it (it may take up to 24 hours to appear).
4. Once activated, costs will be trackable in Cost Explorer by filtering on the tag key "AppManagerCFNStackKey" and value equal to your `projectName` (e.g., "todo").
5. For application-level views, use AWS Systems Manager Application Manager to see the grouped stacks and resources.

## Usage
- Register via registration page.
- Confirm with email code.
- Log in to manage to-dos.
- Logout via navbar.

## Notes
- Centralized config in `project.json` eliminates duplicates. Use a unique `projectName` for each project instance to prevent stack name collisions.
- Stacks output to `outputs/` for automation.
- For production, secure `project.json` and handle DNS.

## Troubleshooting
- Ensure `project.json` is valid before deploy.
- Check CloudWatch for Lambda logs (retention 7 days).
- Cognito uses email verification; test with real emails.
- If config.json is missing during dev (npm start), ensure stacks are deployed and run `node scripts/update-config.js` manually if needed.