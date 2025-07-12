# Grok Project Knowledge Base: To-Do App Boilerplate

This document serves as a comprehensive knowledge base for the To-Do App boilerplate project, enabling continuation of development without prior conversation history. It covers architecture, structure, configuration, deployment, features, tools, and troubleshooting. The project is a full-stack application using AWS CDK V2 for infrastructure, Python Lambdas for API, and React.js with Material-UI for the frontend.

## Project Overview
- **Purpose**: Boilerplate for a personal to-do app with user registration/login (Cognito), to-do CRUD (DynamoDB via API Gateway/Lambda), and hosting (S3/CloudFront).
- **Key Features**:
  - User auth: Register, confirm email, login/logout.
  - To-do list: Add, edit, delete, mark complete (strikes through in UI), filter by text.
  - UI: Material-UI components, spinners for loading, responsive design.
  - Infra: CDK stacks for core (Cognito), API (Gateway/Lambda/DynamoDB), hosting (S3/CloudFront), deployment (separate for code upload).
  - Config: Centralized in `project.json`; dynamic generation for React.
  - Cost Tracking: "AppManagerCFNStackKey" tag on stacks for AWS Systems Manager.
- **Tech Stack**:
  - Backend: AWS CDK V2 (TypeScript), Python 3.12 Lambdas, DynamoDB.
  - Frontend: React 18, Material-UI 5, React Router 6, amazon-cognito-identity-js, react-toastify.
  - Other: Node.js/npm, bash scripts.

## Directory Structure
Root: `cdk-reactjs-app/`
- `project.json`: Centralized config (regions, domains, ARNs, CORS, S3/DynamoDB naming, Cognito fields, projectName for stack prefixing).
- `clean-all.sh`: Bash script to clean node_modules, caches, builds for Git.
- `outputs/`: Generated folder for stack outputs (core.json, api.json, apphosting.json).
- `core-infrastructure/`: CDK stack for Cognito (UserPool, Client, IdentityPool).
  - `bin/core-infrastructure.js`: Entry point, reads project.json.
  - `lib/core-infrastructure-stack.js`: Stack definition.
  - `package.json`, `cdk.json`, `tsconfig.json`, `.gitignore`.
- `api/`: CDK stack for API Gateway, Lambdas, DynamoDB.
  - `bin/api.js`: Entry point, reads project.json and core outputs.
  - `lib/api-stack.js`: Stack definition (RestApi, authorizer, endpoints, CORS, DNS).
  - `lambda/todos.py`: Handles / and /todos (GET/POST).
  - `lambda/todo_item.py`: Handles /todos/{id} (GET/PUT/DELETE).
  - `package.json`, `cdk.json`, `tsconfig.json`, `.gitignore`.
- `apphosting/`: CDK stack for S3 hosting bucket and CloudFront (infra only).
  - `bin/apphosting.js`: Entry point, reads project.json.
  - `lib/apphosting-stack.js`: Stack definition (bucket, distribution, CORS, DNS).
  - `package.json`, `cdk.json`, `tsconfig.json`, `.gitignore`.
- `reactjs-app/`: React frontend.
  - `public/index.html`: HTML template with Roboto font.
  - `src/App.js`: Main app, theme, routes, config loading.
  - `src/App.css`: Basic CSS.
  - `src/index.js`: React root.
  - `src/pages/*`: Pages for login, register, confirm, home.
  - `src/components/*`: UI components (LoginUI, RegisterUI, etc., with MUI).
  - `scripts/update-config.js`: Generates src/config.json from project.json/outputs.
  - `cdk-deploy/`: CDK subproject for code deployment to hosting infra.
    - `bin/cdk-deploy.js`: Entry point, reads apphosting outputs.
    - `lib/cdk-deploy-stack.js`: Deploys build/ to S3, invalidates CloudFront.
    - `package.json`, `cdk.json`, `tsconfig.json`, `.gitignore`.
  - `package.json`: Dependencies (React, MUI, etc.), scripts (prestart/prebuild).
  - `.gitignore`.

## Configuration (project.json)
- `projectName`: Stack prefix (e.g., "todo"); code appends "-" for names.
- `regions`: Default and CloudFront ACM.
- `domains`: Website and API custom domains.
- `acmArns`: ARNs for API and CloudFront certificates.
- `cors`: Allowed origins for CORS.
- `s3`: Hosting bucket naming.
- `dynamodb`: Table naming.
- `cognito`: User attributes.

## Deployment Flow
1. Edit project.json (unique projectName, your domains/ARNs).
2. Deploy core: `cd core-infrastructure && npm install && npm run deploy`.
3. Deploy API: `cd api && npm install && npm run deploy`.
4. Deploy hosting infra: `cd apphosting && npm install && npm run deploy`.
5. React app: `cd reactjs-app && npm install && npm run build` (generates config.json).
6. Deploy code: `cd reactjs-app/cdk-deploy && npm install && npm run deploy` (builds and uploads).

## UI Details
- MUI for components (TextField, Button, List, etc.).
- Spinners for loading (CircularProgress).
- No Fade animations (removed to avoid prop errors).
- Login has register link.
- Home: Greeting, filter, add row, list with edit/delete/complete.

## Tools/Scripts
- `clean-all.sh`: Run `./clean-all.sh` to remove node_modules, builds, etc. for Git.
- `update-config.js`: Generates React config.json from project.json/outputs.

## Cost Tracking
Stacks tagged with "AppManagerCFNStackKey": projectName. Activate in Billing console for Cost Explorer filtering.

## Troubleshooting
- CORS errors: Check origins in project.json match request; redeploy API.
- Auth errors: Ensure Cognito IDs in outputs/core.json.
- White screen: Check config.json generated; console for JS errors.
- Lambda errors: CloudWatch logs (7-day retention).

## Continuing Development
- Add features: Update React components or Lambdas, redeploy relevant stack.
- Customize: Edit project.json, MUI theme in App.js.
- Clean: Use clean-all.sh before Git commits.