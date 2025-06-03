# 🚀 Drive Clone - Google Drive Inspired Cloud Storage App

A full-stack, AWS-native cloud storage solution inspired by Google Drive. Built using a modern React frontend with AWS Cognito authentication and a serverless backend deployed using AWS Lambda, S3, DynamoDB, API Gateway, and CloudFront.

---

## 🧰 Tech Stack

### Frontend:

* React + TypeScript
* TailwindCSS for styling
* AWS Cognito (via `amazon-cognito-identity-js`) for authentication
* Hosted on S3 + CloudFront CDN

### Backend:

* Serverless AWS Lambda functions:

  * `getFiles.ts` - Lists files and folders for a user
  * `generatepresignedURL.ts` - Provides presigned URLs for file uploads
* Secured by API Gateway (JWT auth via Cognito)
* File storage in Amazon S3 (organized per user)
* Metadata stored in DynamoDB (optional, for additional features)

---

## 🔒 Authentication Flow

* AWS Cognito User Pools handle sign-up, login, and token issuance
* Frontend uses the Cognito SDK to authenticate users and get a JWT token
* All backend API requests require a valid `Authorization: Bearer <token>` header

---

## 📁 Folder Structure

```
project-root/              # React app
├── public/
├── src/
│   ├── pages/
│   ├── .env.development     # Local config (ignored in git)
│   ├── App.tsx
│   └── ...
│   └── ...
└── backend/                # Lambda functions
    ├── getFiles.ts
    └── generatepresignedURL.ts
```

> 🔐 `.env.development` contains sensitive info like API URL and Cognito Pool IDs. This file is git-ignored and should be populated manually in each environment.

---

## 🛠️ Local Development

### Prerequisites

* Node.js >= 18
* AWS Account
* AWS CLI configured

### Setup Frontend

```bash
npm install
```

Create `.env.development` in the root of the React app with the following content:

```env
REACT_APP_API_URL=https://your-api-gateway-url
REACT_APP_COGNITO_USER_POOL_ID=your_cognito_user_pool_id
REACT_APP_COGNITO_CLIENT_ID=your_cognito_app_client_id
```

Then run:

```bash
npm start
```

### Deploy Backend

Ensure each file is individually deployed as a Lambda function:

* `getFiles.ts`
* `generatepresignedURL.ts`

Both should:

* Be protected behind API Gateway with Cognito JWT authorizer
* Have access to the S3 bucket and DynamoDB (if used)
* Use environment variables for sensitive data (e.g., S3 bucket name)
---

## 🧪 Features

* 🔐 Secure Cognito login/signup
* 📁 Hierarchical folder navigation with breadcrumbs
* 📤 Drag-and-drop or multi-select file uploads
* 🖼️ Google Drive-like UI built with Tailwind
* ☁️ Real-time fetch of files/folders using Lambda
* 🔗 Secure presigned S3 URLs for direct uploads

---

## 🚀 Deployment

* **Frontend**: Build and upload to S3 bucket

```bash
npm run build
aws s3 sync dist/ s3://your-frontend-bucket-name
```

* **Backend**: Deploy each TypeScript function via Lambda (can use AWS Console or SAM/CDK for IaC)
* **CDN**: Configure CloudFront with S3 origin for frontend and API Gateway as the backend for API routes
* **API Gateway**: Set up routes for Lambda functions with Cognito authorizer
* **Cognito**: Create a User Pool and App Client, configure domain, and set up sign-in/sign-up pages
* **S3**: Create a bucket for file storage, set permissions, and enable CORS
* **DynamoDB**: (Optional) Create a table for storing file metadata if needed
* **CI/CD**: Use AWS CodePipeline for automated deployments

---

## 🧼 Best Practices

* Keep sensitive data in `config.ts` and `.gitignore` it
* Enable CORS and secure headers in API Gateway
* Use IAM roles to restrict Lambda and S3 access
* Enable CloudWatch logs for monitoring

---

## 🤝 Acknowledgements

Inspired by the Google Drive UX. Built for modern cloud-native app deployment on AWS.
